/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as should from 'should';
import * as TypeMoq from 'typemoq';
import * as os from 'os';
import * as path from 'path';
import * as sinon from 'sinon';
import * as utils from '../../common/utils';
import * as constants from '../../common/constants';
import { NewProjectDialog } from '../../dialogs/newProjectDialog';
import { WorkspaceService } from '../../services/workspaceService';
import { testProjectType } from '../testUtils';

suite('DialogBase - workspace validation', function (): void {
	// DialogBase is an abstract class, so we'll just use a NewProjectDialog to test the common base class functions
	let dialog: NewProjectDialog;

	this.beforeEach(async () => {
		const workspaceServiceMock = TypeMoq.Mock.ofType<WorkspaceService>();
		workspaceServiceMock.setup(x => x.getAllProjectTypes()).returns(() => Promise.resolve([testProjectType]));

		dialog = new NewProjectDialog(workspaceServiceMock.object);
		await dialog.open();

		dialog.model.name = `TestProject_${new Date().getTime()}`;
		dialog.model.location = os.tmpdir();
	});

	this.afterEach(() => {
		sinon.restore();
	});

	test('Should validate new workspace location missing file extension', async function (): Promise<void> {
		dialog.workspaceInputBox!.value = 'test';
		should.equal(await dialog.validateNewWorkspace(false), false, 'Validation should fail because workspace does not end in .code-workspace');
		should.equal(dialog.getErrorMessage().text, constants.WorkspaceFileInvalidError(dialog.workspaceInputBox!.value));
	});

	test('Should validate new workspace location with invalid location', async function (): Promise<void> {
		// use invalid folder
		dialog.workspaceInputBox!.value = 'invalidLocation/test.code-workspace';
		should.equal(await dialog.validateNewWorkspace(false), false, 'Validation should fail because the folder is invalid');
		should.equal(dialog.getErrorMessage().text, constants.WorkspaceParentDirectoryNotExistError(path.dirname(dialog.workspaceInputBox!.value)));
	});

	test('Should validate new workspace location that already exists', async function (): Promise<void> {
		// use already existing workspace
		const fileExistStub = sinon.stub(utils, 'fileExist');
		fileExistStub.resolves(true);
		const existingWorkspaceFilePath = path.join(os.tmpdir(), `${dialog.model.name}.code-workspace`);
		dialog.workspaceInputBox!.value = existingWorkspaceFilePath;
		should.equal(await dialog.validateNewWorkspace(false), false, 'Validation should fail because the selected workspace file already exists');
		should.equal(dialog.getErrorMessage().text, constants.WorkspaceFileAlreadyExistsError(existingWorkspaceFilePath));
	});

	test('Should validate new workspace location that is valid', async function (): Promise<void> {
		// same folder as the project should be valid even if the project folder isn't created yet
		dialog.workspaceInputBox!.value = path.join(dialog.model.location, dialog.model.name, 'test.code-workspace');
		should.equal(await dialog.validateNewWorkspace(true), true, `Validation should pass if the file location is the same folder as the project. Error was: ${dialog.getErrorMessage()?.text}`);

		// a workspace not in the same folder as the project should also be valid
		dialog.workspaceInputBox!.value = path.join(os.tmpdir(), `TestWorkspace_${new Date().getTime()}.code-workspace`);
		should.equal(await dialog.validateNewWorkspace(false), true, `Validation should pass because the parent directory exists, workspace filepath is unique, and the file extension is correct. Error was: ${dialog.getErrorMessage()?.text}`);
	});
});

