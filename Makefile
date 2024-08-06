copy-id-pub:
	pbcopy < ~/.ssh/id_rsa.pub

copy-id:
	pbcopy < ~/.ssh/id_rsa

rm-images:
	docker image prune -af
