package de.digitalemil.thegym;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.convert.DurationFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.FileHandler;
import java.util.logging.Handler;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.dmg.pmml.PMML;
import org.jpmml.evaluator.*;
import org.jpmml.model.PMMLUtil;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.xml.sax.SAXException;
import java.net.URLDecoder;
import java.io.PrintWriter;
import io.prometheus.client.hotspot.DefaultExports;
import jakarta.xml.bind.JAXBException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
//import lombok.extern.slf4j.Slf4j;
import groovy.util.logging.Log4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

@SpringBootApplication
@ComponentScan("de.digitalemil.thegym")
@RestController
@Log4j
public class TheGym {
	static String pivotfieldname = "";
	static JSONArray fields;
	static String lastmsg="";
	static String lastresult="";
	static String lasthr="";
	private static final Logger logger = LoggerFactory.getLogger(TheGym.class);
	
	public static void main(String[] args) {
		SpringApplication.run(TheGym.class, args);
		DefaultExports.initialize();
		String appdef = "";
		Map<String, String> env = System.getenv();
		for (String envName : env.keySet()) {
			if (envName.equals("APPDEF"))
				appdef = env.get(envName);
		}
		String json = appdef.replaceAll("'", "\"");
		JSONObject jobj = null;
		System.out.println("---\n" + json + "---");
		jobj = new JSONObject(json);
		fields = jobj.getJSONArray("fields");
		for (int i = 0; i < fields.length(); i++) {
			JSONObject field = fields.getJSONObject(i);
	
			if (field.get("pivot").toString().toLowerCase().equals("true")) {
				pivotfieldname = field.getString("name");
				System.out.println("Pivot field: " + pivotfieldname);
			}
		}
		logger.info("Pivot field: " + pivotfieldname);
	}

	@PostMapping(value = "/", produces = (MediaType.TEXT_PLAIN_VALUE))
	public String doPost(@RequestBody String body ) throws java.io.UnsupportedEncodingException {

		String jsonstring = body;
		//System.out.println("JSON predecode: " + jsonstring);
		jsonstring = URLDecoder.decode(jsonstring.replace("+", "%2B"), "UTF-8").replace("%2B", "+");
		lastmsg= jsonstring;
		//System.out.println("JSON after decode: " + jsonstring);
		// System.out.println("JSON after decode: "+pivotfieldname);
		JSONObject jobj = null;

		String ret = "-1";
		try {
			jobj = new JSONObject(jsonstring);
		//	System.out.println("Value: " + jobj.get(pivotfieldname) + " " + jobj.get("user"));

			Object modelobj = jobj.get("model");
			if (modelobj != null) {
				String model = modelobj.toString();
				model = model.replace("'", "\"");
				logger.info("Model set.");
			
				Evaluator m = setModelString(model);
				ret = getResult(m, model, jobj);
			}
		} catch (Exception e) {
			logger.error(e.toString());
		}
		
		logger.info("In: " + lasthr+" Out: "+lastresult);
		return ret;
	}

	// Needed to run without Hadoop
	//
	private static Evaluator createModelEvaluator(String modelString)
			throws SAXException, JAXBException {

		if (modelString.length() < 8)
			return null;
		Evaluator me = null;
		try {
			InputStream is = new ByteArrayInputStream(modelString.getBytes());

			PMML pmml = PMMLUtil.unmarshal(is);
			ModelEvaluatorBuilder modelEvaluatorBuilder = new ModelEvaluatorBuilder(pmml);
			me = modelEvaluatorBuilder.build();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return me;
	}

	public String getResult(Evaluator evaluator, String modelString, JSONObject jobj) {
		String ret= "-1";
		evaluator.verify();

		if (modelString == null || modelString.length() <= 0
				|| evaluator == null)
			return ret;
		
		Map<String, FieldValue> arguments = new LinkedHashMap<>();

		List<InputField> inputFields = evaluator.getInputFields();
		for (InputField inputField : inputFields) {
			String inputName = inputField.getName();

			Object rawValue = jobj.get(inputName);
			lasthr= jobj.get(inputName).toString();
			// Transforming an arbitrary user-supplied value to a known-good PMML value
			// The user-supplied value is passed through: 1) outlier treatment, 2) missing
			// value treatment, 3) invalid value treatment and 4) type conversion
			FieldValue inputValue = inputField.prepare(rawValue);

			arguments.put(inputName, inputValue);
		}

		Map<String, ?> results = evaluator.evaluate(arguments);

		List<TargetField> targetFields = evaluator.getTargetFields();
		for (TargetField targetField : targetFields) {
			String targetName = targetField.getName();
			Object targetValue = ((Classification)results.get(targetName)).getResult();
			ret= targetValue.toString();
		}
	lastresult= ret.toString();
	return ret;
	}

	public static Evaluator setModelString(String s) {
		try {
			return createModelEvaluator(s);
		} catch (SAXException e) {
			logger.error(e.toString());
		} catch (JAXBException e) {
			logger.error(e.toString());
		}
		return null;
	}

	@Configuration
	public class RequestLoggingFilterConfig {

    @Bean
    public CommonsRequestLoggingFilter logFilter() {
        CommonsRequestLoggingFilter filter
          = new CommonsRequestLoggingFilter();
        filter.setIncludeQueryString(true);
        filter.setIncludeHeaders(true);
        filter.setIncludeClientInfo(true);
        filter.setIncludePayload(true);
        return filter;
    }
}
}
