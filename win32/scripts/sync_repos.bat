set MASTER_GIT=https://github.com/stephomi/sculptgl.git
git clone https://github.com/piaoger/sculptgl.git upstream
cd upstream
git remote add upstream %MASTER_GIT%
git fetch upstream
git merge upstream/master
git push origin master