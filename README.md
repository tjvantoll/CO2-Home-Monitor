# CO2 Home Monitor

This repository contains the firmware and web application source code for building your own home CO2 monitor. You can read the [full instructions for assembling this project on Hackster](https://www.hackster.io/tjvantoll/monitoring-home-co2-levels-with-lorawan-0b53a3).

You can also see a live version of the web app at <https://co2monitor.netlify.app>.

## Firmware

The firmware for this project is written for Arduino using [PlatformIO](https://platformio.org/). The firmware was written for the [Blues Swan](https://shop.blues.com/collections/swan/products/swan), but could be easily adapted for other hosts. If you intend to use this firmware with the Swan, check out the [Swan Quickstart](https://dev.blues.io/quickstart/swan-quickstart/) for instructions on flashing the firmware to your device.

## Web App

This project’s canonical web application lives in `web-app` and is written using [Next.js](https://nextjs.org/). See the [web application’s README](./web-app/README.md) for local setup and Netlify deployment instructions.

## Notecard Config Script

The suggested Notecard configuration for this project is provided in the [config.json](./config.json) file.

See [Run a Setup Script](https://dev.blues.io/tools-and-sdks/notecard-cli/#run-a-setup-script) for instructions on running the setup script on your Notecards.
