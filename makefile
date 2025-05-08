github:
	-git commit -a
	git push origin main

tests:
	npx jest --watch --silent

deploy: tests github
	git push heroku main