import React, { Children, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as zebar from 'zebar';
import Shortcut from "./components/Shortcut";
import ActiveApp from './components/ActiveApp.jsx';
import config from "./config.js";
import moment from "moment";

const providers = zebar.createProviderGroup({
    keyboard: { type: 'keyboard' },
    glazewm: { type: 'glazewm' },
    cpu: { type: 'cpu' },
    date: { type: 'date', formatting: 'EEE d MMM t' },
    battery: { type: 'battery' },
    memory: { type: 'memory' },
    weather: { type: 'weather' },
    host: { type: 'host' }
});

createRoot(document.getElementById('root')).render(<App/>);

function App() {
    const [output, setOutput] = useState(providers.outputMap);
    const [showGoogleSearch, setShowGoogleSearch] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(true);
    const [ShowActiveApp, setShowActiveApp] = useState(true);
    const [dateFormat, setDateFormat] = useState('hh:mm A');

    useEffect(() => {
        providers.onOutput(() => setOutput(providers.outputMap));
    }, []);

    function getBatteryIcon(batteryOutput) {
        if (batteryOutput.chargePercent > 90)
            return <i className="nf nf-fa-battery_4"></i>;
        if (batteryOutput.chargePercent > 70)
            return <i className="nf nf-fa-battery_3"></i>;
        if (batteryOutput.chargePercent > 40)
            return <i className="nf nf-fa-battery_2"></i>;
        if (batteryOutput.chargePercent > 20)
            return <i className="nf nf-fa-battery_1"></i>;
        return <i className="nf nf-fa-battery_0"></i>;
    }

    function getWeatherIcon(weatherOutput) {
        switch (weatherOutput.status) {
            case 'clear_day':
                return <i className="nf nf-weather-day_sunny"></i>;
            case 'clear_night':
                return <i className="nf nf-weather-night_clear"></i>;
            case 'cloudy_day':
                return <i className="nf nf-weather-day_cloudy"></i>;
            case 'cloudy_night':
                return <i className="nf nf-weather-night_alt_cloudy"></i>;
            case 'light_rain_day':
                return <i className="nf nf-weather-day_sprinkle"></i>;
            case 'light_rain_night':
                return <i className="nf nf-weather-night_alt_sprinkle"></i>;
            case 'heavy_rain_day':
                return <i className="nf nf-weather-day_rain"></i>;
            case 'heavy_rain_night':
                return <i className="nf nf-weather-night_alt_rain"></i>;
            case 'snow_day':
                return <i className="nf nf-weather-day_snow"></i>;
            case 'snow_night':
                return <i className="nf nf-weather-night_alt_snow"></i>;
            case 'thunder_day':
                return <i className="nf nf-weather-day_lightning"></i>;
            case 'thunder_night':
                return <i className="nf nf-weather-night_alt_lightning"></i>;
        }
    }
    
    // debug
    console.log(output.glazewm)

    return (
        <div className="app">
            <div className="left">
                <div className="box">
                    <div className="logo">
                        {/* Show 'Ash' as the host name, then workspace displayName */}
                        {"Ash"}
                        {output.glazewm && output.glazewm.focusedWorkspace ? (
                            <>
                                {" | "}
                                {output.glazewm.focusedWorkspace.displayName || output.glazewm.focusedWorkspace.name}
                            </>
                        ) : null}
                        {" |"}
                    </div>
                    {output.glazewm && (
                        <div className="workspaces">
                            {output.glazewm.currentWorkspaces.map(workspace => (
                                <button
                                    className={`workspace ${workspace.hasFocus && 'focused'} ${workspace.isDisplayed && 'displayed'}`}
                                    onClick={() =>
                                        output.glazewm.runCommand(
                                            `focus --workspace ${workspace.name}`,
                                        )
                                    }
                                    key={workspace.name}
                                >
                                    {workspace.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {showShortcuts && output.glazewm ? <div className="workspaces">
                    {/* Removed Edge and Powershell shortcuts */}
                </div> : null}
            </div>

            <div className="center">
                <div className="box">
                    <i className="nf nf-md-calendar_month"></i>
                    <button className="clean-button" onMouseEnter={() => {
                        setDateFormat('ddd DD MMM hh:mm A')
                    }} onMouseLeave={() => {
                        setDateFormat('hh:mm A')
                    }}>
                        {moment(output.date?.now).format(dateFormat)}
                    </button>
                    {ShowActiveApp && output.glazewm ? <ActiveApp output={output} /> : null}
                </div>
            </div>

            <div className="right">
                <div className="box">
                    {output.glazewm && (
                        <>
                            {output.glazewm.bindingModes.map(bindingMode => (
                                <button
                                    className="binding-mode"
                                    key={bindingMode.name}
                                >
                                    {bindingMode.displayName ?? bindingMode.name}
                                </button>
                            ))}

                            <button
                                className={`tiling-direction nf ${output.glazewm.tilingDirection === 'horizontal' ? 'nf-md-swap_horizontal' : 'nf-md-swap_vertical'}`}
                                onClick={() =>
                                    output.glazewm.runCommand('toggle-tiling-direction')
                                }
                            ></button>
                        </>
                    )}

                    {/* Restored system info icons */}
                    {/* memory */}
                    {output.memory && (
                        <button className="memory clean-button" onClick={
                            () => output.glazewm.runCommand('shell-exec taskmgr')
                        }>
                            <i className="nf nf-fae-chip"></i>
                            {Math.round(output.memory.usage)}%
                        </button>
                    )}

                    {/* cpu */}
                    {output.cpu && (
                        <button className="cpu clean-button" onClick={
                            () => output.glazewm.runCommand('shell-exec taskmgr')
                        }>
                            <i className="nf nf-oct-cpu"></i>
                            <span className={output.cpu.usage > 85 ? 'high-usage' : ''}>
                                {Math.round(output.cpu.usage)}%
                            </span>
                        </button>
                    )}

                    {/* battery */}
                    {output.battery && (
                        <div className="battery">
                            {output.battery.isCharging && (
                                <i className="nf nf-md-power_plug charging-icon"></i>
                            )}
                            {getBatteryIcon(output.battery)}
                            {Math.round(output.battery.chargePercent)}%
                        </div>
                    )}

                    {/* weather */}
                    {output.weather && (
                        <div className="weather">
                            {getWeatherIcon(output.weather)}
                            {Math.round(output.weather.celsiusTemp)}°C
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}