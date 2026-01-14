import * as spotifyUtils from '../utils.js'
import React, { useEffect, useState } from 'react';

const SpotifyWidget = () => {
    const [song, setSong] = useState('fetching...');
    const [showSettings, setShowSettings] = useState(false);

    const maxSongLength = window.innerWidth > 1600 ? 30 : 10;

    async function updateSong() {
        const tempSong = await spotifyUtils.getCurrentSong()
        setSong(tempSong)
    }

    let intervalId = [];
    useEffect(() => {
        const updateAndSetInterval = async () => {
            await updateSong();
            const tempId = setInterval(async () => {
                await updateSong();
            }, 1000 * 10);
            intervalId.push(tempId);
        };

        updateAndSetInterval();

        return () => {
            for (const id of intervalId) {
                clearInterval(id);
            }
        };
    }, []);

    const style = {
        textDecoration: 'none', color: 'var(--font-color)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
    }
    const settingsStyle = {
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px',
        paddingRight: '10px',
    }
    const iconStyle = {
        cursor: 'pointer',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        color: 'var(--font-color)', borderRadius: '50%',
    }
    return (
        <button className="clean-button" onMouseEnter={() => setShowSettings(true)}
                onMouseLeave={() => setShowSettings(false)}
                style={style}>

            {showSettings && !['fetching...', 'Error', ''].includes(song) ?
                null
            : null}
        </button>
    );
}

export default SpotifyWidget;