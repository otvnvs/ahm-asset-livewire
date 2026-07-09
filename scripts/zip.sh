#!/bin/bash
PORT=8080
ZIP_PATH=zip/main.zip

# 1. Run the zip process silently
mkdir -p ./zip
zip -r $ZIP_PATH . -x "zip/*" ".*" ".**/*" > /dev/null 2>&1

# 2. Extract network details
IP_ADDRESS=$(cmd.exe /c ipconfig | grep -A 10 "WiFi" | grep "IPv4 Address" | awk -F': ' '{print $2}' | tr -d '\r')
URL="http://$IP_ADDRESS:$PORT/$ZIP_PATH"

# 3. Clear the screen
clear

# 4. Generate the high-contrast UTF8/ANSI block QR code
QR_DATA=$(qrencode -t ansiutf8 "$URL")

# 5. Get terminal dimensions
TERM_COLS=$(tput cols)
TERM_ROWS=$(tput lines)

# Calculate the height (number of rows) of the QR code
QR_HEIGHT=$(echo "$QR_DATA" | wc -l)
PADDING_ROWS=$(( (TERM_ROWS - QR_HEIGHT - 2) / 2 ))

# Print top vertical padding
for ((i=0; i<PADDING_ROWS; i++)); do echo ""; done

# Print the URL centered
URL_LEN=${#URL}
PADDING_URL_COLS=$(( (TERM_COLS - URL_LEN) / 2 ))
printf "%${PADDING_URL_COLS}s%s\n\n" "" "$URL"

# 6. Print the QR code centered horizontally
# We strip ANSI escape sequences to accurately calculate the visible screen width of each line
echo "$QR_DATA" | while IFS= read -r line; do
    # Remove ANSI escape sequences (like \e[40m) to get the true text line
    VISIBLE_LINE=$(echo "$line" | sed 's/\x1b\[[0-9;]*[a-zA-Z]//g')
    LINE_LEN=${#VISIBLE_LINE}
    
    PADDING_COLS=$(( (TERM_COLS - LINE_LEN) / 2 ))
    
    # Print the padding spaces followed by the original styled line
    printf "%${PADDING_COLS}s%s\n" "" "$line"
done

# Print bottom vertical padding
for ((i=0; i<PADDING_ROWS; i++)); do echo ""; done

darkhttpd ./ --port $PORT
