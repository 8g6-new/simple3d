import serial
import sys

def send_gcode(gcode, serial_port, baud_rate):
    with serial.Serial(serial_port, int(baud_rate)) as ser:
        ser.write(gcode.encode() + b'\n')

        response = ''

        while 'ok' not in response:
            line = ser.readline().decode()
            response += line

        print(response)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python send_gcode.py <G-code command> <serial_port> <baud_rate>")
        sys.exit(1)

    gcode_command = sys.argv[1]
    serial_port   = sys.argv[2]
    baud_rate     = sys.argv[3]

    send_gcode(gcode_command, serial_port, baud_rate)
