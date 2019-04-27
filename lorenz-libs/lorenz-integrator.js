class lorenzIntegrator 
{

  constructor(user_config={})
  {

    // default configuration
    let config = {
      sigma: 10.0,
      rho: 28,
      beta: 8/3,
      dt: 0.05,
      initial_condition: [0.1,0.1,10],
    }

    // overwrite default configuration with user configuration
    Reflect.ownKeys(user_config).forEach(function(key){
      config[key] = user_config[key];
    });

    this.sigma = config.sigma;
    this.rho = config.rho;
    this.beta = config.beta;
    this.dt = config.dt;
    this.initial_condition = config.initial_condition;

    // initialize ODE integrator
    this.equation_of_motions = null;
    this.reset_ode();

  }

  reset_ode(user_config={})
  {

    // default configuration
    let config = {
      h: null,
      tol: null,
      dt: null
    }

    // overwrite default configuration with user configuration
    Reflect.ownKeys(user_config).forEach(function(key){
      config[key] = user_config[key];
    });

    this.ode = new rk45();
    
    if (config.h === null)
      config.h = this.dt / 10;
    this.ode.setH(config.h);

    if (config.tol !== null)
      this.ode.setTol(config.tol);

    if (config.dt !== null)
      this.dt = config.dt;

    this.ode.setInitX(this.initial_condition);
    this.ode.setStart(0.0);
    this.ode.setFn(this.get_equations_of_motion());

  }

  get_parameters()
  {
    return {sigma: this.sigma, rho: this.rho, beta: this.beta};
  }

  set_parameters(user_config={})
  {
    let config = {
      sigma: null,
      rho: null,
      beta: null,
    }

    // overwrite default configuration with user configuration
    Reflect.ownKeys(user_config).forEach(function(key){
      config[key] = user_config[key];
    });

    if (config.sigma !== null)
      this.sigma = config.sigma;
    if (config.rho !== null)
      this.rho = config.rho;
    if (config.beta !== null)
      this.beta = config.beta;
  }

  set_initial_values(x0)
  {
    this.initial_condition = x0;
  }

  get_equations_of_motion()
  {
    let fn = [];
    let self = this;

    fn[0] = function(time, x) { return self.sigma*(x[1]-x[0]); }
    fn[1] = function(time, x) { return x[0]*(self.rho - x[2]) - x[1]; };
    fn[2] = function(time, x) { return x[0]*x[1] - self.beta*x[2]; };

    this.equations_of_motion = fn;

    return fn;
  }

  get_next_result()
  {
    this.ode.setStop(this.ode.start + this.dt);
    this.ode.solve();
    let res = this.ode.newX.slice();
    this.ode.adoptCurrentState();

    return {t: this.ode.start, x: res};
  }

}
