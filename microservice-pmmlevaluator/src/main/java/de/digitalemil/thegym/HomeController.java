package de.digitalemil.thegym;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class HomeController {

	@GetMapping({"/home", "/"})
	public String home(@RequestParam(name="The Gym", required=false, defaultValue="The Gym") String name, Model model) {
		model.addAttribute("name", name);
		model.addAttribute("message", TheGym.lastmsg);
		model.addAttribute("result", TheGym.lastresult);
		model.addAttribute("hr", TheGym.lasthr);
		
		return "home";
	}

}