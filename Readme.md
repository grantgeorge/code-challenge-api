## Get Started

> We support Mac and Ubuntu-based operating systems (Windows _might_ work).

### Requirements

Please ensure your operating system has the following software installed:

* [Git][] - see [GitHub's tutorial][github-git] for installation

* [Node.js][node] (v8.3+) - use [nvm][] to install it on any OS

  * After installing `nvm` you will need to run `nvm install node`
  * We also recommend you install [yarn][], which is an alternative to [npm][]

* [MongoDB][] (v3.x+):

  * Mac (via [brew][]): `brew install mongodb && brew services start mongo`
  * Ubuntu:

    ```sh
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
    echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
    sudo apt-get update
    sudo apt-get -y install mongodb-org
    ```

### Usage

#### Development

> The `start` script will start the server

[npm][]:

```sh
npm start
```

[yarn][]:

```sh
yarn start
```

##### Debugging

> As similar to running any other [node][] process, simply use the environment variable `DEBUG`:

[npm][]:

```sh
DEBUG=* npm start
```

[yarn][]:

```sh
DEBUG=* yarn start
```

You can also use `NODE_DEBUG` if desired to debug [node][] internal modules.

#### Tests

> We use [mocha][], [should][], and [supertest][] for testing

[npm][]:

```sh
npm test
```

[yarn][]:

```sh
yarn test
```

##

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[node]: https://nodejs.org

[unix]: https://en.wikipedia.org/wiki/Unix_philosophy

[nvm]: https://github.com/creationix/nvm

[mongodb]: https://www.mongodb.com/

[github-git]: https://help.github.com/articles/set-up-git/

[git]: https://git-scm.com/

[brew]: https://brew.sh/

[koa-better-error-handler]: https://github.com/niftylettuce/koa-better-error-handler

[mocha]: https://mochajs.org/

[should]: https://shouldjs.github.io/

[supertest]: https://github.com/visionmedia/supertest
