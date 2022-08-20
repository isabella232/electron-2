const { contextBridge, ipcRenderer, ipcMain } = require('electron');

/**
 *
 */
contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: {
		myPing() {
			ipcRenderer.send('ipc-example', 'ping');
		},
		on(channel, func) {
			const validChannels = ['ipc-example'];
			if (validChannels.includes(channel)) {
				// Deliberately strip event as it includes `sender`
				ipcRenderer.on(channel, (event, ...args) => func(...args));
			}
		},
		once(channel, func) {
			const validChannels = ['ipc-example'];
			if (validChannels.includes(channel)) {
				// Deliberately strip event as it includes `sender`
				ipcRenderer.once(channel, (event, ...args) => func(...args));
			}
		},
	},
});

// White-listed channels.
const ipc = {
	render: {
		// From render to main.
		send: [
			'config:updateConfig', // Example only
		],
		// From main to render.
		receive: [
			'config:showConfig', // Exmaple only
		],
		// From render to main and back again.
		sendReceive: ['openDatabase'],
	},
};

/**
 *
 */
contextBridge.exposeInMainWorld(
	// Allowed 'ipcRenderer' methods.
	'ipcRenderer',
	{
		// From render to main.
		send: (channel, args) => {
			const validChannels = ipc.render.send;
			if (validChannels.includes(channel)) {
				ipcRenderer.send(channel, args);
			}
		},
		// From main to render.
		receive: (channel, listener) => {
			const validChannels = ipc.render.receive;
			if (validChannels.includes(channel)) {
				// Deliberately strip event as it includes `sender`
				ipcRenderer.on(channel, (event, ...args) => listener(...args));
			}
		},
		// From render to main and back again.
		invoke: (channel, args) => {
			const validChannels = ipc.render.sendReceive;
			if (validChannels.includes(channel)) {
				return ipcRenderer.invoke(channel, args);
			}
		},
	}
);

/**
 *
 */
contextBridge.exposeInMainWorld('sqlite', {
	open: (name) => {
		return ipcRenderer.invoke('sqlite', { type: 'open', name });
	},
	all: (name, sql) => {
		return ipcRenderer.invoke('sqlite', { type: 'all', name, sql });
	},
	run: (name, sql) => {
		return ipcRenderer.invoke('sqlite', { type: 'run', name, sql });
	},
});
