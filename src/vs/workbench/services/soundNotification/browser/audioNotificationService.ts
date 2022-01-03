/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IAudioNotificationService } from 'vs/editor/browser/services/audioNotificationService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { localize } from 'vs/nls';
import { raceTimeout } from 'vs/base/common/async';

export class AudioNotificationService implements IAudioNotificationService {
	public readonly _serviceBrand: undefined;

	constructor(@IConfigurationService private readonly _configurationService: IConfigurationService) {
	}

	private async playSound(fileName: string) {
		if (!this._configurationService.getValue<boolean>('audioNotifications.enabled')) {
			return;
		}

		const audio = new Audio(`../../../workbench/services/soundNotification/browser/media/${fileName}.webm`);
		try {
			// Don't play when loading takes more than 1s, due to loading, decoding or playing issues.
			// Delayed sounds are very confusing.
			await raceTimeout(audio.play(), 1000);
		} catch (e) {
			audio.remove();
		}
	}

	public playBreakpointHitSound(): void {
		if (!this._configurationService.getValue<boolean>('audioNotifications.breakpointHit')) {
			return;
		}

		this.playSound('breakpointHit');
	}
}

registerSingleton(IAudioNotificationService, AudioNotificationService, true);

const registry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);

function registerConfiguration(): void {
	registry.registerConfiguration({
		'properties': {
			'audioNotifications.enabled': {
				'type': 'boolean',
				'description': localize('audioNotifications.enabled', "Controls whether audio cues are enabled."),
				'default': false
			},
			'audioNotifications.breakpointHit': {
				'type': 'boolean',
				'markdownDescription': localize('audioNotifications.breakpointHit', "Controls whether an audio cue should be played when a breakpoint is hit."),
				'default': true
			},
		}
	});
}

registerConfiguration();
