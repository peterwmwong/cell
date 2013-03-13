define ['require','../specs/GENERATED_all-specs','jquery'], (require,specs,jquery)->
  jquery.noConflict true
  jasmine.WaitsForBlock.TIMEOUT_INCREMENT = 0
  spec() for spec in specs
  trivialReporter = new jasmine.TrivialReporter()
  jasmineEnv = jasmine.getEnv()
  jasmineEnv.updateInterval = 5000
  jasmineEnv.addReporter trivialReporter
  jasmineEnv.specFilter = (spec)-> trivialReporter.specFilter spec
  jasmineEnv.execute()
