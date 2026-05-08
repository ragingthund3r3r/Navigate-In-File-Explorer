import { Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, NavigateInFileExplorerSettings, NavigateInFileExplorerSettingTab } from './settings';

export default class NavigateInFileExplorer extends Plugin {
	settings: NavigateInFileExplorerSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new NavigateInFileExplorerSettingTab(this.app, this));

		this.addCommand({
			id: 'navigate-up',
			name: 'Navigate up (previous file)',
			callback: () => this.navigate(-1)
		});

		this.addCommand({
			id: 'navigate-down',
			name: 'Navigate down (next file)',
			callback: () => this.navigate(1)
		});
	}

	navigate(direction: -1 | 1) {
		// 1. Get the currently active file inside the editor
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) return;

		// 2. Find the file explorer leaf component
		const leaf = this.app.workspace.getLeavesOfType("file-explorer").first();
		if (!leaf) return;

		// 3. Extract the container element
		const container = leaf.view.containerEl;
		if (!container) return;

		// 4. Find all currently visible files in the file explorer view 
		// By querying the DOM we implicitly respect any custom sort plugins and only see files inside expanded folders
		const fileEls = Array.from(container.querySelectorAll('.nav-file-title[data-path]'));
		let paths = fileEls
			.map(el => el.getAttribute('data-path'))
			.filter(p => p !== null) as string[];
			
		// 5. Restrict to current folder if setting is enabled
		if (this.settings.restrictToCurrentFolder) {
			const activeFileParentPath = activeFile.parent?.path;
			paths = paths.filter(p => {
				const file = this.app.vault.getAbstractFileByPath(p);
				return file && file.parent?.path === activeFileParentPath;
			});
		}

		// 6. Calculate position and locate target file
		const currentIndex = paths.indexOf(activeFile.path);
		if (currentIndex === -1) return; // Current file isn't visible in explorer

		let targetIndex = currentIndex + direction;
		
		if (this.settings.loopNavigation && paths.length > 0) {
			targetIndex = (targetIndex + paths.length) % paths.length;
		} else if (targetIndex < 0 || targetIndex >= paths.length) {
			return; // Out of bounds check
		}

		const targetPath = paths[targetIndex];
		if (!targetPath) return;

		const targetFile = this.app.vault.getAbstractFileByPath(targetPath);

		// 7. Open the file
		if (targetFile instanceof TFile) {
			this.app.workspace.getLeaf(false).openFile(targetFile);
		}
	}

	onunload() {
		// Plugin cleanup logic
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<NavigateInFileExplorerSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
