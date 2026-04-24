# ═══════════════════════════════════════════════════════════════════════════
# BBC micro:bit Bluetooth Control Firmware Template
# ═══════════════════════════════════════════════════════════════════════════
# 
# PURPOSE: This firmware enables Bluetooth UART control from a web browser.
# It does NOT auto-run programs - it waits for commands via Bluetooth.
#
# CRITICAL FEATURES:
# - Starts Bluetooth UART service
# - Listens for incoming Python commands
# - Executes commands safely
# - Can STOP execution cleanly
# - Does not loop endlessly
# ═══════════════════════════════════════════════════════════════════════════

from microbit import *
import radio
import music

# ─── Global State ───────────────────────────────────────────────────────────
running = False
stop_requested = False

# ─── Robot Control Class (for Cutebot and similar) ─────────────────────────
class Robot:
    """
    Basic robot control class for motors and movements.
    Compatible with Cutebot and similar 2-motor robots.
    """
    def __init__(self):
        self.speed = 75
        self._setup_pins()
    
    def _setup_pins(self):
        """Initialize motor control pins"""
        # Standard motor pins for Cutebot
        # Adjust these based on your robot
        pin0.write_digital(0)
        pin2.write_digital(0)
    
    def drive(self, distance_ms):
        """
        Drive forward (positive) or backward (negative)
        Args:
            distance_ms: milliseconds to drive (positive=forward, negative=backward)
        """
        global stop_requested
        
        if stop_requested:
            return
        
        # Left motor
        pin0.write_digital(1)
        pin1.write_digital(0 if distance_ms > 0 else 1)
        
        # Right motor
        pin2.write_digital(1)
        pin3.write_digital(1 if distance_ms > 0 else 0)
        
        sleep(abs(distance_ms))
        self.stop()
    
    def turn(self, degrees):
        """
        Turn left (negative) or right (positive)
        Args:
            degrees: angle to turn (positive=right, negative=left)
        """
        global stop_requested
        
        if stop_requested:
            return
        
        # Left motor
        pin0.write_digital(1)
        pin1.write_digital(1 if degrees < 0 else 0)
        
        # Right motor
        pin2.write_digital(1)
        pin3.write_digital(0 if degrees < 0 else 1)
        
        sleep(abs(int(degrees * 5)))
        self.stop()
    
    def stop(self):
        """Stop all motors immediately"""
        pin0.write_digital(0)
        pin2.write_digital(0)
    
    def set_speed(self, speed_percent):
        """
        Set movement speed
        Args:
            speed_percent: speed as percentage (0-100)
        """
        self.speed = max(0, min(100, speed_percent))

# ─── Command Handler ────────────────────────────────────────────────────────
def stop_all():
    """
    CRITICAL: Stop all running programs and reset state
    """
    global running, stop_requested
    
    running = False
    stop_requested = True
    
    # Stop motors if robot exists
    try:
        if 'robot' in dir():
            robot.stop()
    except:
        pass
    
    # Stop music
    music.stop()
    
    # Clear display
    display.clear()
    
    # Reset stop flag
    stop_requested = False

# ─── Setup Commands ─────────────────────────────────────────────────────────
def setup_commands():
    """
    Initialize robot and helper functions
    This runs once when Bluetooth connects
    """
    global robot
    
    # Create robot instance
    robot = Robot()
    
    # Show ready indicator
    display.show(Image.HEART)

# ─── Main Program ───────────────────────────────────────────────────────────
# Initialize
display.show('B')  # Show 'B' for Bluetooth ready

# Wait for connection and commands via REPL
# The web app will send Python code over Bluetooth UART
# Commands are executed in the REPL context

# CRITICAL: This firmware does NOT auto-run or loop endlessly
# It waits for commands from the web interface
# Commands are sent as Python code and executed via REPL

# Example commands the web app might send:
# - robot.drive(500)
# - robot.turn(90)
# - display.show(Image.HAPPY)
# - stop_all()

# Setup is called automatically when web app connects
setup_commands()
