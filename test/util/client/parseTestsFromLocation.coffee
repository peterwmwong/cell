define -> ->
   # Parse comma delimited test suite names from url 
   # ex. ?test=suite1,suite2,suite3
   for item in document.location.search.slice(1).split('&')
      [k,v] = item.split '='
      if k == 'tests' and v?
         return (decodeURIComponent(suiteName) for suiteName in v.split ',')
