using Toybox.WatchUi;

class LokiRunsView extends WatchUi.View {
 var hr= null;
 var lon = null;
 var lat = null;
 
    function initialize() {
        View.initialize();
    }

    // Load your resources here
    function onLayout(dc) {
        setLayout(Rez.Layouts.MainLayout(dc));
        hr= findDrawableById("hr");
        hr.setText("---");
        lon= findDrawableById("lon");
		lon.setText("---");
		lat= findDrawableById("lat");
		lat.setText("---");	
    }

	function updateHR(text) {
		if(hr != null && text != null) {
			hr.setText(text+" bpm");
			WatchUi.requestUpdate();
		}
	}
	
	function updateLocation(lonText, latText) {
		if(lonText != null && latText != null && lon != null && lat != null) {
			lon.setText(lonText+"");
			lat.setText(latText+"");
			WatchUi.requestUpdate();
		}
	}
	
    // Called when this View is brought to the foreground. Restore
    // the state of this View and prepare it to be shown. This includes
    // loading resources into memory.
    function onShow() {
    }

    // Update the view
    function onUpdate(dc) {
        // Call the parent onUpdate function to redraw the layout
        View.onUpdate(dc);
    }

    // Called when this View is removed from the screen. Save the
    // state of this View here. This includes freeing resources from
    // memory.
    function onHide() {
    }

}
