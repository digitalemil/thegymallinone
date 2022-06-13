package de.digitalemil.thegym.sqlui;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Controller
public class HomeController {
	private static final Logger logger = LoggerFactory.getLogger(TheGymSQLUI.class);

	@GetMapping("/home")
	public String home(@RequestParam(name="name", required=false, defaultValue="Quartet") String name, Model model) {
		logger.info("Rendering home. Setting name to: "+name);
		model.addAttribute("name", name);
		return "home";
	}

}