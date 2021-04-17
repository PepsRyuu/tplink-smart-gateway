# TPLink Smart Gateway

WebSocket server that acts as a single entry point and connects to TPLink Smart devices.
This is useful for talking to TPLink devices without needing to know the underlying UDP protocol.
This is mostly for my own home usage for the devices that I have. Not intended to be more than that.

## Supported Devices

* TPLink Kasa KL130.
* It likely works with way more TPLink devices, but I don't have them to test with!

## How to Use

* Devices must be onboarded to your wifi already.
* Connect to the WebSocket endpoint: ```/devices```
* Once connected, trigger a broadcast: ```{ "action": "get-info" }```.
* Device information will be sent down the WebSocket in the format: ```{ "info": {...}, "ip": "192.168.0.150" }```
* To send a payload, send on the socket: ```{ "action": "send-payload", "ip": "192.168.0.150", "payload": {...} }```

## Example Payloads

Changing a bulb colour: 

```
{
    "action": "send-payload",
    "ip": "192.168.0.150",
    "payload": {
        "smartlife.iot.smartbulb.lightingservice": {
            "transition_light_state": {
                ignore_default: 1,
                on_off: 1,
                transition_period: 0,
                color_temp: 0,
                hue: 240,
                saturation: 100,
                brightness: 100
            }
        }
    }
}
```

