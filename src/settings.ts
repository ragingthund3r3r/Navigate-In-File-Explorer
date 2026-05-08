import { App, PluginSettingTab, Setting } from "obsidian";
import NavigateInFileExplorer from "./main";

export interface NavigateInFileExplorerSettings {
	restrictToCurrentFolder: boolean;
	loopNavigation: boolean;
}

export const DEFAULT_SETTINGS: NavigateInFileExplorerSettings = {
	restrictToCurrentFolder: false,
	loopNavigation: false
}

export class NavigateInFileExplorerSettingTab extends PluginSettingTab {
	plugin: NavigateInFileExplorer;

	constructor(app: App, plugin: NavigateInFileExplorer) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Restrict to current folder')
			.setDesc('When enabled, navigating up and down will only cycle through files in the same folder as the current file.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.restrictToCurrentFolder)
				.onChange(async (value) => {
					this.plugin.settings.restrictToCurrentFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Loop navigation')
			.setDesc('When enabled, navigating past the first or last file will wrap around to the other end.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.loopNavigation)
				.onChange(async (value) => {
					this.plugin.settings.loopNavigation = value;
					await this.plugin.saveSettings();
				}));
	}
}
