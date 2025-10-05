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

