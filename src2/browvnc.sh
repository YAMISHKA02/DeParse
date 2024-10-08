#!/bin/bash

showw() {
  echo -e "\033[1;33m$1\033[0m"
}

show() {
  echo -e "\033[1;32m$1\033[0m"
}

# Вывод текста построчно
showw " ____   _   _  ___  ____   _   _  _  __    _    "
showw "/ ___| | | | ||_ _|/ ___| | | | || |/ /   / \   "
showw "\___ \ | |_| | | | \___ \ | |_| || ' /   / _ \  "
showw " ___) ||  _  | | |  ___) ||  _  || . \  / ___ \ "
showw "|____/ |_| |_||___||____/ |_| |_||_|\_\/_/   \_\ "
showw "  ____  ____ __   __ ____  _____  ___           "
showw " / ___||  _ \\ \ / /|  _ \|_   _|/ _ \          "
showw "| |    | |_) |\ V / | |_) | | | | | | |         "
showw "| |___ |  _ <  | |  |  __/  | | | |_| |         "
showw " \____||_| \_\ |_|  |_|     |_|  \___/          "
showw " _   _   ___   ____   _____  ____               "
showw "| \ | | / _ \ |  _ \ | ____|/ ___|              "
showw "|  \| || | | || | | ||  _|  \___ \              "
showw "| |\  || |_| || |_| || |___  ___) |             "
showw "|_| \_| \___/ |____/ |_____||____/              "


if ! [ -x "$(command -v curl)" ]; then
  show "curl is not installed. Please install it to continue."
  exit 1
else
  show "curl is already installed."
fi

IP=$(curl -s ifconfig.me)

CREDENTIALS_FILE="$HOME/vps-browser-credentials.json"
mkdir -p "$HOME/chromium/config"

# Запрашиваем логин и пароль
read -p "Username для браузера: " USERNAME
read -sp "Пароль для доступа к браузеру: " PASSWORD
echo ""

# Проверка наличия Docker
if ! [ -x "$(command -v docker)" ]; then
  show "Docker is not installed. Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  if [ -x "$(command -v docker)" ]; then
    show "Docker installation was successful."
  else
    show "Docker installation failed."
    exit 1
  fi
else
  show "Docker is already installed."
fi

show "Pulling the latest Chromium Docker image..."
if ! docker pull linuxserver/chromium:latest; then
  show "Failed to pull the Chromium Docker image."
  exit 1
else
  show "Successfully pulled the Chromium Docker image."
fi

# Прокси данные из файла
PROXY_LIST="proxies.txt"  # Путь к файлу с прокси
PORT_START=10000           # Начальный порт для контейнеров
DATA_DIR="$HOME/chromium/config"  # Основная директория для хранения данных
COUNT=0                    # Счетчик для имен контейнеров

# Проверка наличия файла с прокси
if [[ ! -f "$PROXY_LIST" ]]; then
    show "Не можем обранужить $PROXY_LIST, файл с прокси не существует."
    exit 1
fi

# Читаем файл с прокси
while IFS=: read -r PROXY_IP PROXY_PORT PROXY_LOGIN PROXY_PASSWORD; do
    # Проверка, что все значения были прочитаны
    if [[ -z "$PROXY_IP" || -z "$PROXY_PORT" || -z "$PROXY_LOGIN" || -z "$PROXY_PASSWORD" ]]; then
        show "Skipping invalid proxy entry: $PROXY_IP:$PROXY_PORT:$PROXY_LOGIN:$PROXY_PASSWORD"
        continue
    fi
    
    PORT=$((PORT_START + COUNT))
    CONTAINER_NAME="${USERNAME}_${PROXY_IP//./_}_${PROXY_PORT}"  # Заменяем точки на подчеркивания для имени контейнера

    # Уникальная директория для хранения данных контейнера
    UNIQUE_DATA_DIR="$DATA_DIR/$CONTAINER_NAME"
    mkdir -p "$UNIQUE_DATA_DIR"

    # Генерация уникального User-Agent (можно заменить на свои варианты)
    USER_AGENT=$(shuf -n 1 -e "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36" \
                     "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" \
                     "Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36")

    show "Attempting to create container: $CONTAINER_NAME"

    # Проверяем, существует ли контейнер
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        show "The Chromium Docker container $CONTAINER_NAME is already running."
    else
        show "Running Chromium Docker Container $CONTAINER_NAME..."

        PROXY_URL="http://$PROXY_LOGIN:$PROXY_PASSWORD@$PROXY_IP:$PROXY_PORT"

        # Выводим параметры для проверки
        show "Proxy URL: $PROXY_URL"
        show "Username: $USERNAME"
        show "Password: $PASSWORD"
        show "User-Agent: $USER_AGENT"

        # Запускаем контейнер
        docker run -d --name "$CONTAINER_NAME" \
          --privileged \
          -e TITLE=ShishkaCrypto \
          -e DISPLAY=:1 \
          -e PUID=1000 \
          -e PGID=1000 \
          -e CUSTOM_USER="$USERNAME" \
          -e PASSWORD="$PASSWORD" \
          -e LANGUAGE=en_US.UTF-8 \
          -e HTTP_PROXY="$PROXY_URL" \
          -e HTTPS_PROXY="$PROXY_URL" \
          -e USER_AGENT="$USER_AGENT" \
          -v "$UNIQUE_DATA_DIR:/config" \
          -p "$PORT:3000" \
          --shm-size="2gb" \
          --restart unless-stopped \
          lscr.io/linuxserver/chromium:latest

        if [ $? -eq 0 ]; then
            show "Chromium $CONTAINER_NAME успешно запущен."
        else
            show "Ошибка при старте докер контейнера $CONTAINER_NAME."
            exit 1
        fi
    fi
    
    COUNT=$((COUNT + 1))  # Увеличиваем счетчик
done < "$PROXY_LIST"

showw "Откройте этот адрес http://$IP:10000/ для запуска браузера извне"
showw "Введите это имя пользователя: $USERNAME в браузере"
showw "Введите этот пароль в браузере"
showw "Не забудь подписаться https://t.me/shishka_crypto"
