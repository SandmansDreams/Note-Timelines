/* NOTES
Steps of running
1. Create a folder with the name of the note
2. Create a duplicate of the note and place both in folder
3. Make it appear as if there is just one note instead of a folder
4. 
*/


/* IMPORTS */
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, addIcon, Menu, MarkdownPostProcessorContext, FileView, Vault, TAbstractFile, TFile, normalizePath} from 'obsidian';
import { gutter, GutterMarker, ViewPlugin, ViewUpdate, WidgetType, Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { StateField, StateEffect, RangeSet, RangeSetBuilder, EditorState, Facet, Extension, Line } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import * as path from 'path';

/* FUNCTIONS */
export default class NoteTimelines extends Plugin { // Main function
	async onload() {
		this.establishCommands();
	}

	onunload() {

	}
	
	async establishCommands() {
		const vault = this.app.vault;
		const adapter = this.app.vault.adapter;
		
		this.addCommand({
			id: 'test-folder-stuff',
			name: 'Test Folder Stuff',
			callback: async () => {
				let activeFile = this.app.workspace.getActiveFile();
				let filePath = activeFile?.path, fileName = activeFile?.name, fileBaseName = activeFile?.basename;
				let parentFolder = filePath?.substring(0, filePath?.lastIndexOf("/")); // Should give the last directory of the file
				let newFolderPath = normalizePath(`${parentFolder}/${fileBaseName}`); // Should format the path correctly for use in other functions
				console.log('File Path: ' + filePath)
				console.log('Parent Folder: ' + parentFolder)
				console.log('New Path: ' + newFolderPath)

				if (activeFile){
					// Create the folder if it doesn't exist
					try {
						await this.app.vault.createFolder(newFolderPath);
						console.log(`Folder created at: ${newFolderPath}`);

					} catch (e) {
						if (e.message.includes("Folder already exists")) {
							console.log("Folder already exists, continuing...");
						} else {
							console.error("Error creating folder:", e);
						return;
						}
					}

					// Move the file into the folder
					const newFilePath = normalizePath(`${newFolderPath}/${fileName}`);
					try {
					  await this.app.fileManager.renameFile(activeFile, newFilePath);
					  console.log(`File moved to ${newFilePath}`);
					} catch (e) {
					  console.error("Error moving file:", e);
					  return;
					}

					// Copy the file again into the same folder
					const copiedFilePath = normalizePath(`${newFolderPath}/${fileBaseName} (copy).md`);
					const newFile = this.app.vault.getAbstractFileByPath(newFilePath);
					if (newFile instanceof TFile) {
						try {
							await this.app.vault.copy(newFile, copiedFilePath);
							console.log(`File copied to ${copiedFilePath}`);
						} catch (e) {
							console.error("Error copying file:", e);
						}
					}
				}

			}
		})
	}

}
