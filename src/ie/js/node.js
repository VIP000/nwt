document.querySelectorAll = document.querySelectorAll || Sizzle;

//if (!Element.prototype.addEventListener) {
	var oListeners = {};
	function runListeners(oEvent) {
		if (!oEvent) { oEvent = window.event; }
		for (var iLstId = 0, iElId = 0, oEvtListeners = oListeners[oEvent.type]; iElId < oEvtListeners.aEls.length; iElId++) {

			if (oEvtListeners.aEls[iElId] === this) {

				// Normalize the target and methods
				oEvent.target = oEvent.srcElement;
				oEvent.stopPropagation = function() {
					window.event.cancelBubble = true;
				}
				oEvent.preventDefault = function() {
					event.returnValue = false;
				}

				for (iLstId; iLstId < oEvtListeners.aEvts[iElId].length; iLstId++) {
					oEvtListeners.aEvts[iElId][iLstId].call(this, oEvent);
				}
				break;
			}
		}
	}
	document.addEventListener = Element.prototype.addEventListener = function (sEventType, fListener /*, useCapture (will be ignored!) */) {
		if (oListeners.hasOwnProperty(sEventType)) {

			var oEvtListeners = oListeners[sEventType];
			for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
				if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
			}

			if (nElIdx === -1) {
				oEvtListeners.aEls.push(this);
				oEvtListeners.aEvts.push([fListener]);
				this["on" + sEventType] = runListeners;
			} else {
				var aElListeners = oEvtListeners.aEvts[nElIdx];
				if (this["on" + sEventType] !== runListeners) {
					aElListeners.splice(0);
					this["on" + sEventType] = runListeners;
				}
				for (var iLstId = 0; iLstId < aElListeners.length; iLstId++) {
					if (aElListeners[iLstId] === fListener) { return; }
				}
				aElListeners.push(fListener);
			}
		} else {
			oListeners[sEventType] = { aEls: [this], aEvts: [ [fListener] ] };
			this["on" + sEventType] = runListeners;
		}
	};
	document.removeEventListener = Element.prototype.removeEventListener = function (sEventType, fListener /*, useCapture (will be ignored!) */) {

		if (!oListeners.hasOwnProperty(sEventType)) { return; }

		var oEvtListeners = oListeners[sEventType];
		for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
			if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
		}

		if (nElIdx === -1) { return; }
		for (var iLstId = 0, aElListeners = oEvtListeners.aEvts[nElIdx]; iLstId < aElListeners.length; iLstId++) {
			if (aElListeners[iLstId] === fListener) { aElListeners.splice(iLstId, 1); }
		}
	};
//}

/**
 * Resolves JS Styles
 */
nwt.augment('Node', '_jsStyle', function (name) {
	var lookupMap = {float: 'styleFloat'};

	if (lookupMap[name]) name = lookupMap[name];
	return name;
});



/**
 * Simulates a click event on a node
 */
nwt.augment('Node', 'click', function () {
	var evt = document.createEventObject();
	return !this._node.fireOnThis.fireEvent( 'onclick', evt );
});

/**
 * Fires an event on a node
 */
nwt.augment('Node', 'fire', function (event, callback) {
	var testEvt = {
		srcElement : this._node,
		type : event	
	}

	runListeners.call(this._node, testEvt)
});



