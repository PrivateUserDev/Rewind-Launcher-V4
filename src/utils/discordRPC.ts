import { invoke } from '@tauri-apps/api/core';

export const discordRPC = {
  async init(clientId: string = '1380659212547260619') {
    try {
      await invoke('discord_rpc_init', { clientId });
      console.log('Discord RPC initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize Discord RPC:', error);
      return false;
    }
  },


  async setLauncherActivity(userAvatarUrl?: string, username?: string) {
    try {
      await invoke('discord_rpc_set_activity', {
        activity: {
          details: "Logged in as "+username,
          state: "In Launcher",
          large_image: "rewindlogo",
          large_text: "In Launcher",
          small_image: userAvatarUrl,
          small_text: username,
          start_timestamp: Math.floor(Date.now() / 1000),
          buttons: [
            {
              label: "Rewind",
              url: "https://discord.gg/rewindogfn"
            }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to set Launcher activity:', error);
    }
  },
 
  async setLibraryActivity(userAvatarUrl?: string, username?: string) {
    try {
      await invoke('discord_rpc_set_activity', {
        activity: {
          details: "Logged in as "+username,
          state: "Library",
          large_image: "rewindlogo",
          large_text: "Library",
          small_image: userAvatarUrl,
          small_text: username,
          start_timestamp: Math.floor(Date.now() / 1000),
          buttons: [
            {
              label: "Rewind",
              url: "https://discord.gg/rewindogfn"
            }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to set Launcher activity:', error);
    }
  },

  async setPlayingActivity(version: string, userAvatarUrl?: string, username?: string) {
    try {
      await invoke('discord_rpc_set_activity', {
        activity: {
          details: "Logged in as "+username,
          state: "Playing "+version,
          large_image: "rewindlogo",
          large_text: "Playing Rewind",
          small_image: userAvatarUrl,
          small_text: "Logged in as"+username,
          start_timestamp: Math.floor(Date.now() / 1000),
          buttons: [
            {
              label: "Rewind",
              url: "https://discord.gg/rewindogfn"
            }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to set playing activity:', error);
    }
  },

  async setShopActivity(userAvatarUrl?: string, username?: string) {
    try {
      await invoke('discord_rpc_set_activity', {
        activity: {
          details: "Logged in as "+username,
          state: "Browsing Item Shop",
          large_image: "rewindlogo",
          large_text: "Browsing Item Shop",
          small_image: userAvatarUrl,
          small_text: "Logged in as "+username,
          start_timestamp: Math.floor(Date.now() / 1000),
          buttons: [
            {
              label: "Rewind",
              url: "https://discord.gg/rewindogfn"
            }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to set shop activity:', error);
    }
  },

   async setSettingsActivity(userAvatarUrl?: string, username?: string) {
    try {
      await invoke('discord_rpc_set_activity', {
        activity: {
          details: "Logged in as "+username,
          state: "Configuring Settings",
          large_image: "rewindlogo",
          large_text: "Settings",
          small_image: userAvatarUrl,
          small_text: "Logged in as"+username,
          start_timestamp: Math.floor(Date.now() / 1000),
          buttons: [
            {
              label: "Rewind",
              url: "https://discord.gg/rewindogfn"
            }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to set settings activity:', error);
    }
  },

  async setListeningActivity(
  userAvatarUrl?: string,
  username?: string,
  albumCover?: string,
  songName?: string,
  songInformation?: string,
  duration?: number
) {
  try {
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = duration ? startTime + duration : undefined;

    await invoke('discord_rpc_set_activity', {
      activity: {
        details: songName ? `${songName}` : "Music",
        state: songInformation || "",
        large_image: albumCover || "",
        large_text: songName || "",
        small_image: userAvatarUrl || "",
        small_text: username ? `Logged in as ${username}` : undefined,
        start_timestamp: startTime,
        end_timestamp: endTime,
        buttons: [
          {
            label: "Rewind",
            url: "https://discord.gg/rewindogfn"
          }
        ]
      }
    });
  } catch (error) {
    console.error('Failed to set Listening activity:', error);
  }
},
  async setHome(userAvatarUrl?: string, username?: string) {
    try {
      await invoke('discord_rpc_set_activity', {
        activity: {
          details: "Logged in as "+username,
          state: "Home",
          large_image: "rewindlogo",
          large_text: "Home",
          small_image: userAvatarUrl,
          small_text: "Logged in as "+username,
          start_timestamp: Math.floor(Date.now() / 1000),
          buttons: [
            {
              label: "Rewind",
              url: "https://discord.gg/rewindogfn"
            }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to set shop activity:', error);
    }
  },

  async clearActivity() {
    try {
      await invoke('discord_rpc_clear_activity');
    } catch (error) {
      console.error('Failed to clear activity:', error);
    }
  },


  async disconnect() {
    try {
      await invoke('discord_rpc_disconnect');
    } catch (error) {
      console.error('Failed to disconnect Discord RPC:', error);
    }
  }
};
