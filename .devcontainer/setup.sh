#! /bin/bash
#
# Inspired by https://github.com/helen/wcus-2021/tree/trunk/.devcontainer
#

SLUG=super-admin-all-sites-menu
PROJECT_TYPE=plugin
WPARG=--network
IS_MULTISITE=1

if [[ ! -z "$CODESPACE_NAME" ]]; then
	SITE_HOST="https://${CODESPACE_NAME}-8080.githubpreview.dev"
else
	SITE_HOST="http://localhost:8080"
fi

exec 3>&1 4>&2
trap 'exec 2>&4 1>&3' 0 1 2 3
exec 1>setup.log 2>&1

# Prepare a nice name from project name for the site title.
function getTitleFromSlug() {
	local _slug=${SLUG//-/ }
	local __slug=${_slug//_/ }
	local ___slug=($__slug)
	echo "${___slug[@]^}"
}

source ~/.bashrc

# Install dependencies
cd /var/www/html/wp-content/${PROJECT_TYPE}s/${SLUG}/
npm i && npm run build

# Install WordPress and activate the plugin/theme.
cd /var/www/html/
echo "Setting up WordPress at $SITE_HOST"
wp db reset --yes
if [[ $IS_MULTISITE -eq 1 ]]; then
	wp core multisite-install --url="$SITE_HOST" --title="$(getTitleFromSlug) Development" --admin_user="admin" --admin_email="admin@example.com" --admin_password="password" --skip-email

	#Add 100 sub sites.
	for ((i = 1; i <= 100; i++)); do 
		site_num=$(printf "%03d" $i)
		wp site create --slug="site-$site_num" --title="Test Site $site_num"; 
	done
else
	wp core install --url="$SITE_HOST" --title="$(getTitleFromSlug) Development" --admin_user="admin" --admin_email="admin@example.com" --admin_password="password" --skip-email
fi

echo "Activate $SLUG"
wp $PROJECT_TYPE activate $SLUG $WPARG
