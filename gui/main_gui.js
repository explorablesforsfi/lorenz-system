function start_main_gui(div_id,width,height,lorenz)
  {
		let controlbox_width = width,
			controlbox_height = height,
			n_grid_x = 24, // these two variables
			n_grid_y = 24; // are used for putting a grid on the controls panels
	

		// this is the svg for the controls
		
		let controls = d3.select(div_id).append("svg")
			.attr("width",controlbox_width)
			.attr("height",controlbox_height)
			.attr("class","explorable_widgets");
			//.style("border","1px solid black")


		// this defines a grid, only used for making it easier to place widgets
		// kind of a simple integer internal coordinate system
		
		let g = widget.grid(controlbox_width,controlbox_height,n_grid_x,n_grid_y);

		let anchors = g.lattice(); // g has a method that returns a lattice with x,y coordinates

		// here we draw the lattice (usually not done in production)
/*

		controls.selectAll(".grid").data(anchors).enter().append("circle")
			.attr("class","grid")
			.attr("transform",function(d){return "translate("+d.x+","+d.y+")"})
			.attr("r",1)
			.style("fill","black")
			.style("stroke","none")
*/

		///////////////////
		// buttons
		///////////////////

		// we first define the button parameters

		let b4 = { id:"b4", name:"", actions: ["play","pause"], value: 0};
		let b5 = { id:"b5", name:"", actions: ["stop"], value: 0};

		// values of these parameters are changed when the widget is activated

		// now we generate the button objects and put them into an array, the last button is modified a bit from its default values

		let buttons = [
			widget.button(b4).size(60).symbolSize(30).update(function(d){
        if (lorenz.is_running)
          lorenz.stop()
        else
          lorenz.start()
      }),
			widget.button(b5).size(60).symbolSize(30).update(function(d){
        if (lorenz.is_running)
        {
          buttons[0].click();
        }
        lorenz.reset();
      }),
		]
		// now we define a block in the control panel where the buttons should be placed

		let buttonbox = g.block({x0:2.5,y0:4,width:4.5,height:0}).Nx(buttons.length);

		// now we draw the buttons into their block

		controls.selectAll(".button").data(buttons).enter().append(widget.buttonElement)
			.attr("transform",function(d,i){return "translate("+buttonbox.x(i)+","+buttonbox.y(0)+")"});	


		///////////////////
		// toggles
		///////////////////
/*

		// we first define the toggle parameters

		let t4 = {id:"t4", name: "generate new for each change",  value: !use_growing_occupation };
		let use_log_y = {id:"t3", name: "histogram log-y",  value: true };
		let use_log_x = {id:"t2", name: "histogram log-x",  value: true };


		// now the array of toggle objets

		let toggles = [
			widget.toggle(t4).label("right").update(function(d){
          use_growing_occupation = !use_growing_occupation;
          create_a_new_one();
      }),
			widget.toggle(use_log_y).label("right").update(function(d){
          if (use_log_y.value)
            h_pl.yscale("log");
          else
            h_pl.yscale("lin");
          plot_component_histogram();
      }),
			widget.toggle(use_log_x).label("right").update(function(d){
          if (use_log_x.value)
            h_pl.xscale("log");
          else
            h_pl.xscale("lin");
          plot_component_histogram();
      }),
		]

		// here comes the block for the toggles

		let togglebox = g.block({x0:10,y0:1.5,width:4,height:3}).Ny(toggles.length);

		// and here we att them to the panel

		controls.selectAll(".toggle").data(toggles).enter().append(widget.toggleElement)
			.attr("transform",function(d,i){return "translate("+togglebox.x(0)+","+togglebox.y(i)+")"});	
*/


		///////////////////
		// sliders
		///////////////////	

		let x1 = {id:"sigma-slider", name: "", range: [0,100], value: lorenz.lorenz_integrator.sigma};
		let x2 = {id:"rho-slider", name: "", range: [0,100], value: lorenz.lorenz_integrator.rho};
		let x3 = {id:"beta-slider", name: "", range: [0,100], value: lorenz.lorenz_integrator.beta};


		let sliders = [
			widget.slider(x3).update(function(){
        lorenz.set_parameters({beta: x3.value}); 
        d3.selectAll("#beta-show").text("β = "+d3.format(".2f")(x3.value));
      }),
			widget.slider(x2).update(function(){
        lorenz.set_parameters({rho: x2.value}); 
        d3.selectAll("#rho-show").text("ρ = "+d3.format(".2f")(x2.value));
      }),
			widget.slider(x1).update(function(){
        lorenz.set_parameters({sigma: x1.value}); 
        d3.selectAll("#sigma-show").text("σ = "+d3.format(".2f")(x1.value));
      })
		]

		let sliderbox = g.block({x0:1,y0:8,width:22,height:30}).Ny(6);

		sliders.forEach(function(d){
			d.width(sliderbox.w())
		})


		controls.selectAll(".slider").data(sliders).enter().append(widget.sliderElement)
			.attr("transform",function(d,i){return "translate("+sliderbox.x(0)+","+sliderbox.y(i)+")"});	
    controls.append("text")
        .attr("id","sigma-show")
        .attr("x",sliderbox.x(0))
        .attr("y",sliderbox.y(2.3))
        .attr("style",'font-size: 18; font-family: Helvetica, Arial, sans-serif')
        .text("σ = "+d3.format(".2f")(x1.value))
    controls.append("text")
        .attr("id","rho-show")
        .attr("x",sliderbox.x(0))
        .attr("y",sliderbox.y(1.3))
        .attr("style",'font-size: 18; font-family: Helvetica, Arial, sans-serif')
        .text("ρ = "+d3.format(".2f")(x2.value))
      ;
    controls.append("text")
        .attr("id","beta-show")
        .attr("x",sliderbox.x(0))
        .attr("y",sliderbox.y(0.3))
        .attr("style",'font-size: 18; font-family: Helvetica, Arial, sans-serif')
        .text("β = "+d3.format(".2f")(x3.value))
      ;
    /*
    

		let r2 = {id:"r2", name:"local field", choices: ["no local field at cursor","positive local field at cursor","negative local field at cursor"], value:0,
              labelColors:["#000",colors[1], colors[0]]};
    local_field = "none";

		let radios = [
			widget.radio(r2).label("left").shape("round").update(function(){
        if (r2.value == 0)
          local_field = "none";
        else if (r2.value == 1)
          local_field = "positive";
        else if (r2.value == 2)
          local_field = "negative";
      }),
		]

    

		let radiobox  = g.block({x0:22,y0:0.5,width:3,height:5}).Nx(3);
	

		radios.forEach(function(d){
			d.size(radiobox.h())
		})

		controls.selectAll(".radio").data(radios).enter().append(widget.radioElement)
			.attr("transform",function(d,i){return "translate("+radiobox.x(i)+","+radiobox.y(0)+")"});	
      */
  }
