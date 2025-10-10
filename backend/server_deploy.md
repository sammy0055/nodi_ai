# deploy script for vurt server
- first ugrade server pages
sudo apt update && sudo apt upgrade -y
- update server for docker componse install
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release -y
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

- add docker
sudo apt-get install docker-compose-plugin -y
sudo apt-get install docker.io -y

- test packages
docker compose down
docker compose up -d --build
-----------------------------------------------------------------
https with canddy ------------------------
Step 1: Install Caddy ---------------------------------
sudo apt update
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo apt-key add -
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy -y

Step 2: Configure Caddy ----------------------------
sudo nano /etc/caddy/Caddyfile
Put this in: -----
labanon.naetechween.com {
    reverse_proxy localhost:4000
}
to open file: cat /etc/caddy/Caddyfile

Step 3: Restart Caddy---------------------------------
sudo systemctl restart caddy

Firewall blocking ports → Make sure ports 80 and 443 are open in Vultr.------------
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload

retart canddy and check status -------------------
sudo systemctl restart caddy
sudo systemctl status caddy -n 20

