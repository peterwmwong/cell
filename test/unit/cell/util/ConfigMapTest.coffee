define ->
   $testObj: 'cell/util/ConfigMap'
   
   'ConfigMap.get(key): Should throw error if {key} does not exist': (require,get,done)-> get (ConfigMap)->
      try
         (new ConfigMap).get 'doesNotExist'
         ok false, 'Should throw error if Config {key} does not exist'
      done()

   'ConfigMap.get(key): Should return value of {key}': (require,get,done)-> get (ConfigMap)->
      equal new ConfigMap(
               'key':
                  value: (value = {})
            ).get('key'),
            value,
            'Should return value for {key}'
      done()

   'ConfigMap.set(key,value): Should throw error if {key} does not exist': (require,get,done)-> get (ConfigMap)->
      try
         (new ConfigMap).set 'doesNotExist', 'whatever'
         ok false, 'Should throw error if Config {key} does not exist'
      done()

   'ConfigMap.set(key,value): Should set {key} to {value}': (require,get,done)-> get (ConfigMap)->
      cm = new ConfigMap
         'key':
            value: {}

      cm.set 'key', (value = {})

      equal cm.get('key'), value, 'Should set value of Config {key}'
      done()

   'ConfigMap.set(key,value): Should throw error if {value} does not pass validate': (require,get,done)-> get (ConfigMap)->
      try
         (new ConfigMap
            'key':
               validate: (v)-> typeof v == 'object'
               value: {}
         ).set 'key', 'invalid value'
         ok false, 'Should throw error if {value} does not pass validate on Config {key}'
      done()

