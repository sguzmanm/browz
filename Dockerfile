# For now it is here: https://hub.docker.com/repository/docker/sguzmanm/linux_playwright_tests/general
# Also copied from https://github.com/microsoft/playwright/tree/master/.ci/node10
FROM ubuntu
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
RUN apt -y install git

# Get node 10
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get update && apt-get -y install nodejs
RUN nodejs -v

# Get chromium libs
RUN apt-get update
RUN apt-get -y install xvfb gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
    libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
    libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
    libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget && \
    rm -rf /var/lib/apt/lists/*

# Get webkit libs
RUN apt-get update
RUN curl -sL https://raw.githubusercontent.com/WebKit/webkit/master/Tools/wpe/install-dependencies >> install-webkit.sh
RUN chmod 755 ./install-webkit.sh && yes | ./install-webkit.sh

# Resemble
RUN apt-get update
RUN apt-get -y install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Add user so we don't need --no-sandbox.
RUN groupadd -r pwuser && useradd -r -g pwuser -G audio,video pwuser \
    && mkdir -p /home/pwuser/Downloads \
    && chown -R pwuser:pwuser /home/pwuser

# Run everything after as non-privileged user.
USER pwuser
WORKDIR /tmp
ARG MAIN_DIR="thesis/browser-execution"


# Copy exec dirs
RUN git clone https://github.com/sguzmanm/thesis.git
RUN cd ${MAIN_DIR} && npm install
CMD ["sh","-c","cd /tmp/thesis && git pull origin master && cd browser-execution && nodejs index.js"]