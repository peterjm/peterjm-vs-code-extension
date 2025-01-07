import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('peterjm-vs-code-extension.testCurrentFile', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor');
			return;
		}

		const document = editor.document;
		const fileName = vscode.workspace.asRelativePath(document.fileName);

		let terminal = vscode.window.terminals.find(t => t.name === 'tt');
		if (!terminal) {
			terminal = vscode.window.createTerminal('tt');
		}
		terminal.show(true);
		terminal.sendText(`tt ${fileName}`);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('peterjm-vs-code-extension.openAlternateFile', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor');
			return;
		}

		const document = editor.document;
		const fileName = vscode.workspace.asRelativePath(document.fileName);
		const workspaceUri = vscode.workspace.getWorkspaceFolder(document.uri)!.uri;

		exec(`cd ${workspaceUri.path} && related-files --number=1 --exclude-self ${fileName}`, (error, stdout, stderr) => {
			if (error) {
				vscode.window.showErrorMessage(`Error finding alternate file: ${error.message}`);
				return;
			}
			if (stderr) {
				vscode.window.showErrorMessage(`Error finding alternate file: ${stderr}`);
				return;
			}
			const trimmedOutput = stdout.trim();
			if (!trimmedOutput) {
				vscode.window.showInformationMessage('No alternate file found.');
				return;
			}
			const fileToOpen = vscode.Uri.joinPath(workspaceUri, trimmedOutput);
			vscode.workspace.openTextDocument(fileToOpen).then(doc => {
				vscode.window.showTextDocument(doc);
			});
		});
	}));
}

export function deactivate() {}