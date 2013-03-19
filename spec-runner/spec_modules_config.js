require.config({
  context: 'specRunner', // TODO rename spec-runner
  baseUrl: '../spec-runner/',
  paths: {
    'SpecHelpers': '../spec-runner/SpecHelpers',
    'spec': '../spec-runner/spec',
    'jquery': '../support/jquery',
    'defer': '../src/util/defer',
    'dom/browser': '../src/dom/browser',
    'sinon-server': '../support/sinon/sinon-server'
  },
  shim: {
    'sinon-server': { exports:'sinon' }
  },
  deps: [
    'SpecRunner'
  ]
});