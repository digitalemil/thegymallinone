package de.digitalemil.thegym.sqlui;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.context.annotation.ComponentScan;


import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


// CREATE DATABASE mydb COLOCATED=true;
@SpringBootApplication
@ComponentScan("de.digitalemil.thegym")
@RestController
public class TheGymSQLUI {
	@Autowired
	DataSource ds;
	@Autowired
	JdbcTemplate jdbcTemplate;
	private static final Logger logger = LoggerFactory.getLogger(TheGymSQLUI.class);
 	
	public static void main(String[] args) {
		logger.info("Starting microservice-sqlui");
		SpringApplication.run(TheGymSQLUI.class, args);
	}

	@PostMapping("/execute")
	public String execute(@RequestBody String body) {
		String in= body;
		if(in.toString().startsWith("\"")) {
			in= body.replace("\"", "").replace("\\", "\"");
		}
	    logger.info("In: "+in);
		String result= "";
		try {
		
			String sql= new JSONObject(in).getString("sql");
			logger.info("Executing: "+sql);
		
			List<Map<String, Object>> res= null;
			try {
				res= jdbcTemplate.queryForList(sql);
			}
			catch (Exception e) {
				logger.error("Exception: "+e.toString());
			}
			for (int i = 0; res!= null && i < res.size(); i++) {
				Iterator<Object> le= res.get(i).values().iterator();
			
		        while (le.hasNext()) {
					String value= "";
					try {
						value= le.next().toString();
						logger.info("value= " + value);
						result+= value;	
					}
					catch(Exception e) {
					}
        			if(le.hasNext())
					result+= ", ";
        		}
				result+= "\n";
			}
		}
		catch(Exception e) {
			logger.error(e.toString());
		}
	    
		logger.info("Result: "+result);
		return result;
	}

	private String get(String key, JSONObject jobj, String defaultvalue) {
		if(!jobj.has(key))
			return defaultvalue;
		else
			return jobj.getString(key);
	}

	@PostMapping("/datasource")
	public String datasource(@RequestBody String body) {
		String in= body;
		if(in.toString().startsWith("\"")) {
			in= body.replace("\"", "").replace("\\", "\"");
		}
		logger.info("In: "+in);
	
		JSONObject jobj= new JSONObject(in);

		String type= get("type", jobj, "postgres");
		String ip = get("ip", jobj, "127.0.0.1");
		String user = get("user", jobj, "thegym");
		String password = get("password", jobj, "thegym");
		String dbname = get("dbname", jobj, "thegym");
		String port = get("port", jobj, "5432");
		String endpoints = get("endpoints", jobj, "");
		String poolsize= get("poolsize", jobj, "16");
		String geo= get("geo", jobj, "");

		DataSource ds = null;

		if (type.equals("postgres")) {
			logger.info("Using Postgres Driver.");
			ds = new SpringJdbcConfig().dataSource(ip, port, user, password, dbname);
		} else {
			logger.info("Using Yugabyte Smartdriver.");
			ds = new SpringJdbcConfig().ybDataSource(ip, port, user, password, dbname, endpoints, poolsize, geo);
		}
		jdbcTemplate.setDataSource(ds);
		try {
			logger.info("JDBC URL: " + jdbcTemplate.getDataSource().getConnection().getMetaData().getURL());
		} catch (Exception e1) {
			logger.error(e1.toString());
		}
		return "Datasource created? "+ds.toString();
	}

}
