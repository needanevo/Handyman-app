# deploy-handyman
git -C . pull --ff-only
sudo systemctl restart handyman-api
journalctl -u handyman-api -n 50 --no-pager
