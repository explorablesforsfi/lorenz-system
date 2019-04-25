class Lorenz 
{
  constructor(user_config={})
  {

    // default configuration
    let config = {
      lorenz_div: null,
      plot_div: null,
      bifurcation_div: null,
      lorenz_width: 200,
      lorenz_height: 200,
      phase_space: ['yz','xz','xy'],
      oscillators: ['x','y','z'],
      plot_width: 200,
      plot_height: 200,
      integrator_config: {},
      second_integrator_config: null,
      plot_config: {
        margin: 14,
        fontsize: 12
      },
      max_number_of_values: 3000,
      update_callback: function () {}
    }

    // overwrite default configuration with user configuration
    Reflect.ownKeys(user_config).forEach(function(key){
      config[key] = user_config[key];
    });

    this.integrator_config = config.integrator_config;
    this.lorenz_integrator = new lorenzIntegrator(this.integrator_config);
    this.timer = null;

    this.second_integrator_config = config.second_integrator_config;
    if (this.second_integrator_config !== null)
      this.second_integrator = new lorenzIntegrator(config.second_integrator_config);
    else
      this.second_integrator = null;

    this.draw_lorenz = (config.lorenz_div !== null);
    this.plot_lorenz = (config.plot_div !== null);

    this.lorenz_width = config.lorenz_width;
    this.lorenz_height = config.lorenz_height;
    this.plot_width = config.plot_width;
    this.plot_height = config.plot_height;
    this.plot_config = config.plot_config;
    this.phase_space = config.phase_space;
    this.oscillators = config.oscillators;
    this.update_callback = config.update_callback;
    this.max_number_of_values = config.max_number_of_values;

    let colors = d3.scaleOrdinal(d3.schemeDark2);
    this.colors = [colors(0), colors(1), colors(2)]
    this.is_running = false;
    this.reset_observables();

    if (this.draw_lorenz)
    {
      this.init_draw_canvas(config.lorenz_div);
      this.init_draw();
      this.draw_update();
    }
    if (this.plot_lorenz)
    {
      this.init_plot_canvas(config.plot_div);
      this.init_plot();
      this.plot_update();
    }

  }

  start()
  {
    let self = this;
    this.is_running = true;
    this.timer = d3.timer( function () { self.single_update(self); });

  }

  single_update(self=null,draw=true)
  {
      // check if call came from the timer. if it did not
      // assume `this` refers to the class and not the calling
      // function
      if (self === null)
        self = this;

      let res = self.lorenz_integrator.get_next_result();
      let xyz = res.x;
      let t = res.t;
      self.time.push(t);
      self.x.push(xyz[0]);
      self.y.push(xyz[1]);
      self.z.push(xyz[2]);

      if ((self.max_number_of_values !== null) && (self.time.length > self.max_number_of_values))
      {
        self.time = self.time.slice(1);
        self.x = self.x.slice(1);
        self.y = self.y.slice(1);
        self.z = self.z.slice(1);
      }

      if (this.second_integrator !== null)
      {
        let res = self.second_integrator.get_next_result();
        let xyz = res.x;
        let t = res.t;
        self.time2.push(t);
        self.x2.push(xyz[0]);
        self.y2.push(xyz[1]);
        self.z2.push(xyz[2]);

        if ((self.max_number_of_values !== null) && (self.time2.length > self.max_number_of_values))
        {
          self.time2 = self.time2.slice(1);
          self.x2 = self.x2.slice(1);
          self.y2 = self.y2.slice(1);
          self.z2 = self.z2.slice(1);
        }

      }

      if (draw)
      { 
        if (self.draw_lorenz)
          self.draw_update();
        if (self.plot_lorenz)
          self.plot_update();
      }

      self.update_callback();

  }

  fast_forward(nsteps=null)
  {
    let steps;
    if (nsteps !== null)
      steps = nsteps;
    else if (this.max_number_of_values !== null)
      steps = this.max_number_of_values;
    else
      throw "need either a number of steps as in fast_forward(n_steps) or a max number of values in lorenz.max_number_of_values" 
    for(let i=0; i<this.max_number_of_values; ++i)
    {
      this.single_update(this,false);
    }
    if (this.draw_lorenz)
      this.draw_update();
    if (this.plot_lorenz)
      this.plot_update();
  }

  stop()
  {
    this.timer.stop();
    this.is_running = false;
  }

  draw_update()
  {
    let snd_int = (this.second_integrator !== null);


    let t = this.time;
    let t2;

    if (snd_int)
      t2 = this.time2;


    for(let i=0; i<this.oscillators.length; ++i){
      let o = this.oscillators[i];
      
      let x;
      if (o == 'x')
        x = this.x;
      else if (o == 'y')
        x = this.y;
      else if (o == 'z')
        x = this.z;

      this.osc_pl[i].xlim(d3.extent(t),false);
      this.osc_pl[i].plot("trajectory_"+o,t,x,{linecolor:this.colors[i]},!snd_int);

      if (snd_int)
      {
        let x2;
        if (o == 'x')
          x2 = this.x2;
        else if (o == 'y')
          x2 = this.y2;
        else if (o == 'z')
          x2 = this.z2;

        this.osc_pl[i].xlim(d3.extent(t2),false);
        this.osc_pl[i].plot("trajectory2_"+o,t2,x2,{linecolor:'rgba(0,0,0,0.5)',linewidth:2},true);
      }
    }
  }

  plot_update()
  {
    let snd_int = (this.second_integrator !== null);

    for(let i=0; i<this.phase_space.length; ++i){
      let ps = this.phase_space[i];
      
      let x = [];
      let x2 = [];
      let self = this;

      for(let j=0; j<2; ++j)
      {
        let o = ps[j];
        if (o == 'x')
        {
          x.push(self.x);
          if (snd_int) x2.push(self.x2);
        }
        else if (o == 'y')
        {
          x.push(self.y);
          if (snd_int) x2.push(self.y2);
        }
        else if (o == 'z')
        {
          x.push(self.z);
          if (snd_int) x2.push(self.z2);
        }
      }

      this.pl[i].plot("trajectory_"+ps,x[0],x[1],{linecolor:this.colors[i]},!snd_int);
      if (snd_int)
        this.pl[i].plot("trajectory2_"+ps,x2[0],x2[1],{linecolor:'rgba(0,0,0,0.5)',linewidth:2},true);

    }
  }

  init_draw_canvas(div)
  {
    // create canvas DOM and context to draw on 
    this.draw_canv = [];
    this.draw_ctx = [];

    for(let i=0; i<this.oscillators.length; ++i){
      this.draw_canv[i] = d3.select(div)
                     .append('canvas')
                     .attr('width', this.lorenz_width)
                     .attr('height', this.lorenz_height);
      this.draw_ctx[i] = this.draw_canv[i].node().getContext('2d');

      // adjust for retina display
      this.retina(this.draw_canv[i],
                  this.draw_ctx[i],
                  this.lorenz_width,
                  this.lorenz_height
                 );
    }
  }

  init_plot_canvas(div)
  {
    // create canvas DOM and context to draw on 
    this.plot_canv = [];
    this.plot_ctx = [];

    for(let i=0; i<this.phase_space.length; ++i){
      this.plot_canv[i] = d3.select(div)
                     .append('canvas')
                     .attr('width', this.plot_width)
                     .attr('height', this.plot_height);
      this.plot_ctx[i] = this.plot_canv[i].node().getContext('2d');

      // adjust for retina display
      this.retina(this.plot_canv[i],
                  this.plot_ctx[i],
                  this.plot_width,
                  this.plot_height
                 );
    }
  }

  init_plot()
  {
    this.pl = []; 
    for(let i=0; i<this.phase_space.length; ++i){
      this.pl[i] = new simplePlot(this.plot_ctx[i],
                               this.plot_width,
                               this.plot_height,
                               this.plot_config
                               );
      let ps = this.phase_space[i];
      this.pl[i].xlimlabels(['','']);
      this.pl[i].ylimlabels(['','']);
      this.pl[i].xlabel(ps[0]);
      this.pl[i].ylabel(ps[1]);
    }
  }

  init_draw()
  {
    this.osc_pl = []
    for(let i=0; i<this.oscillators.length; ++i){
      this.osc_pl[i] = new simplePlot(this.draw_ctx[i],
                               this.lorenz_width,
                               this.lorenz_height,
                               this.plot_config
                               );
      let o = this.oscillators[i];
      this.osc_pl[i].xlimlabels(['','']);
      this.osc_pl[i].ylimlabels(['','']);
      this.osc_pl[i].xlabel('time');
      this.osc_pl[i].ylabel(o);
    }
  }

  reset()
  {
    this.lorenz_integrator.reset_ode();

    if (this.second_integrator !== null)
      this.second_integrator.reset_ode();

    this.reset_observables();

    if (this.draw_lorenz)
    {
      this.init_draw();
      this.draw_update();
    }

    if (this.plot_lorenz)
    {
      this.init_plot();
      this.plot_update();
    }

  }

  reset_observables()
  {
    this.time = [0];
    this.x = [this.lorenz_integrator.initial_condition[0]];
    this.y = [this.lorenz_integrator.initial_condition[1]];
    this.z = [this.lorenz_integrator.initial_condition[2]];

    if (this.second_integrator !== null)
    {
      this.time2 = [0];
      this.x2 = [this.second_integrator.initial_condition[0]];
      this.y2 = [this.second_integrator.initial_condition[1]];
      this.z2 = [this.second_integrator.initial_condition[2]];
    }

  }

  set_parameters(params)
  {
    this.lorenz_integrator.set_parameters(params);
    if (this.second_integrator !== null)
      this.second_integrator.set_parameters(params);
  }

  // nicer display on retina
  retina(canv,cont,w,h)
  {
    if (window.devicePixelRatio)
    {
        canv
            .attr('width', w * window.devicePixelRatio)
            .attr('height', h * window.devicePixelRatio)
            .style('width', w + 'px')
            .style('height', h + 'px');

        cont.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }
}
