process.env.DEBUG = 'test'

let path    = require('path'),
    util    = require('util'),
    fs      = require('fs'),
    extend  = require('extend'),
    fse     = require('fs-extra'),
    proc    = require('child_process'),
    sh      = require('execSync'),
    debug   = require('debug')('test')


let testedReactVersions = [ '0.12.2', '0.13.2' ],
    playgroundFolder    = path.resolve(__dirname, '../.playground')



module.exports = (testName, example, cb) => {

  describe(testName, () => {

    let backendServerProc  = null,
        liveReactloadProc  = null,
        seleniumServerProc = null

    before(() => {
      debug('initialize playground with "%s"', example)
      initPlayground(example)
      liveReactloadProc  = spawn('node_modules/.bin/livereactload listen')
      seleniumServerProc = spawn('java -jar selenium-server-standalone-2.45.0.jar', __dirname)
    })

    after(() => {
      if (liveReactloadProc) {
        liveReactloadProc.kill()
        liveReactloadProc = null
      }
      if (seleniumServerProc) {
        seleniumServerProc.kill()
        seleniumServerProc = null
      }
    })

    afterEach(() => {
      if (backendServerProc) {
        backendServerProc.kill()
        backendServerProc = null
      }
    })

    testedReactVersions.map((version) => {
      it('supports LiveReactload with React version ' + version, (done) => {
        setupReact(version)
        resetPlaygroundPublicFolder(example)
        backendServerProc = spawn('node server.js')
        cb(new TestHelpers, done)
      })
    })

  })

}

function TestHelpers() {
  this.exec = exec

  this.rebundle = (opts = {}) => {
    debug('rebundle assets')
    let preProcess = opts.preProcess || '-t reactify',
        myFlag     = opts.isGlobal === false ? '-t' : '-g'

    fse.removeSync(path.resolve(playgroundFolder, 'static/bundle.js'))
    exec(util.format('node_modules/.bin/browserify %s %s livereactload site.js >> static/bundle.js', preProcess, myFlag))
  }

  this.notify = () => {
    debug('notify reloading client')
    exec('node_modules/.bin/livereactload notify')
  }

  this.replaceTextFromFile = (file, text, replacement) => {
    let filename = path.resolve(playgroundFolder, 'public', file)
    fs.writeFileSync(filename, fs.readFileSync(filename).toString().replace(text, replacement))
  }

}


function initPlayground(example) {
  copyExampleData(example)
  initNodeModules()

  function copyExampleData(example) {
    debug('copy example data')
    fse.removeSync(playgroundFolder)
    fse.copySync(path.resolve(__dirname, '../../examples/', example), playgroundFolder)
  }

  function initNodeModules() {
    debug('init node modules')
    let nodeModulesDir = path.resolve(playgroundFolder, 'node_modules')
    fse.removeSync(nodeModulesDir)

    // use this repository implementations in tests, paths are npm 2.x compatible and
    // relative to .playground folder
    let packageJson = path.resolve(playgroundFolder, 'package.json')
    fse.outputJsonSync(packageJson, extend(true, fse.readJsonSync(packageJson), {
      dependencies: {
        'livereactload-api': 'file:../../node_modules/livereactload-api'
      },
      devDependencies: {
        'livereactload': 'file:../../'
      }
    }))
    exec('npm install')
  }
}

function setupReact(version) {
  debug('install React %s', version)
  let reactDir = path.resolve(playgroundFolder, 'node_modules/react')
  fse.removeSync(reactDir)
  exec('npm install react@' + version)
}

function resetPlaygroundPublicFolder(example) {
  let playgroundPublicDir = path.resolve(playgroundFolder, 'public'),
      examplePublicDir    = path.resolve(__dirname, '../../examples/', example, 'public')

  fse.removeSync(playgroundPublicDir)
  fse.copySync(examplePublicDir, playgroundPublicDir)
}


function exec(cmd) {
  try {
    debug('exec command "%s"', cmd)
    let exitCode = sh.run('cd "' + playgroundFolder + '" && ' + cmd)
    if (exitCode !== 0) {
      throwInitError('Non-zero exit code from command "' + cmd + '": ' + exitCode)
    }
  } catch (e) {
    if (!isInitError(e)) {
      throwInitError('Exec command "' + cmd + '" caused unexpected exception: ' + e)
    }
  }
}

function spawn(cmd, cwd = playgroundFolder) {
  debug('spawn async process with command "%s"', cmd)
  let command = cmd.split(' ')[0],
      args    = cmd.split(' ').slice(1)

  return proc.spawn(command, args, {cwd})
}


function throwInitError(msg) {
  var e = new Error(msg)
  e.__fromInit = true
  throw e
}

function isInitError(e) {
  return e.__fromInit === true
}
