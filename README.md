# gitUp_backend

## How to build
### For local deploy
1. Clone and init submodules (only needed first time)
```
git clone --recursive git@github.com:GitAwwwShit/gitUp_backend.git
```
OR
```
git clone git@github.com:GitAwwwShit/gitUp_backend.git
git submodule init
git submodule update
```

2. Update submodule, build it, and build/deploy full app
```
cd gitUp_front
git pull
gulp
cd ..
gulp
```

##### Info on submodules
https://git-scm.com/book/en/v2/Git-Tools-Submodules
