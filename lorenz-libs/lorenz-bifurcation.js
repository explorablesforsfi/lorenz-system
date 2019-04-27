class lorenzBifurcation {

  constructor(bifurcation_div,control_parameter_string,user_config={}){

    // default configuration
    let config = {
        plotted_observable_string: 'x',
        control_observable_string: 'y',
        control_observable_value: 0,
        plot_width: 200,
        plot_height: 200,
        plot_config: {
             fastScatter: true
        }
      }

    // overwrite default configuration with user configuration
    Reflect.ownKeys(user_config).forEach(function(key){
      config[key] = user_config[key];
    });
    
    this.plotted_observable_string = config.plotted_observable_string
    this.control_observable_string = config.control_observable_string
    this.control_observable_value = config.control_observable_value
    this.control_parameter_string = control_parameter_string
    this.plot_width = config.plot_width
    this.plot_height = config.plot_height
    this.plot_config = config.plot_config

    this.all_param_values = [];
    this.all_obs_values = [];
    this.current_obs_values = [];
    this.current_param_values = [];

    this.init_plot_canvas(bifurcation_div)
    this.init_plot();
  }

  update_values(time,vals,redraw=true){

    let x = this.plotted_observable_string;
    let y = this.control_observable_string;
    let p = this.control_parameter_string;

    let new_observed = vals[x];
    let last_observed = this.last_observed_value;
    let new_ctrl = vals[y];
    let last_ctrl = this.last_control_value;
    let critical = this.control_observable_value;


    if ( 
         ((time-this.last_reset_time) > this.equilibration_time)
        &&
         ( 
            ((last_ctrl < critical) && (new_ctrl >= critical))
          ||
            ((last_ctrl > critical) && (new_ctrl <= critical))
         )
       )
    {
      let yScale = d3.scaleLinear()
                     .domain([last_ctrl,new_ctrl])
                     .range([last_observed,new_observed]);
      let this_x = yScale.invert(critical);
      this.all_param_values.push(this.current_parameter);
      this.all_obs_values.push(this_x);
      this.current_obs_values.push(this_x);
      this.current_param_values.push(this.current_parameter);

      if (redraw)
        this.update_plot();
    }

    this.last_observed_value = new_observed;
    this.last_control_value = new_ctrl;

  }

  update_parameters(time,equilibration_time,params,vals){
    let x = this.plotted_observable_string;
    let y = this.control_observable_string;
    let p = this.control_parameter_string;

    this.last_observed_value = vals[x];
    this.last_control_value = vals[y];
    this.current_parameter = params[p];
    
    this.reset_current_measurement();
    this.last_reset_time = time;
    this.equilibration_time = equilibration_time;
  }


  reset_current_measurement(){
    this.current_obs_values = [];
    this.current_control_values = [];
  }

  init_plot_canvas(div)
  {
    // create canvas DOM and context to draw on 
    this.plot_canv = d3.select(div)
                   .append('canvas')
                   .attr('width', this.plot_width)
                   .attr('height', this.plot_height);
    this.plot_ctx = this.plot_canv.node().getContext('2d');

    // adjust for retina display
    this.retina(this.plot_canv,
                this.plot_ctx,
                this.plot_width,
                this.plot_height
               );
  }

  init_plot()
  {
      this.pl = new simplePlot(this.plot_ctx,
                               this.plot_width,
                               this.plot_height,
                               this.plot_config
                               );
      //this.pl.xlimlabels(['','']);
      //this.pl.ylimlabels(['','']);
      this.pl.xlabel(this.control_parameter_string);
      this.pl.ylabel(this.plotted_observable_string);
  }


  update_plot()
  {
    this.pl.scatter('cobweb',this.all_param_values,this.all_obs_values,{markerradius:0.5})
  }

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
