define(["kendo", "pubsub", "CFLibrary"], function (kendo, pubsub, CFLibrary) {
       
	
	 var QMSHoistDataSource = new kendo.data.DataSource({
	        data: [],
	        pageSize: 10
	    }); 
	 
    var model = kendo.observable({
        isVisible: true,
        HoistResponseVisible: false,
        lRestrictedMode: false,  
        getFormattedDate: function(dDate) {
            return kendo.toString(kendo.parseDate(dDate),"dd/MM/yyyy");
        },      
        cDebtCode: "",
        HoistTransactions: QMSHoistDataSource,
        myDataBound: function (e) {

        },     
        CFError: {},
        clearData: function () {
            this.set("HoistTransactions.cDebtCode", "");  
            QMSHoistDataSource.page(1);
            QMSHoistDataSource.data([]);  
            
        },
        getImage: function(cType) {
        	var imgTemplate = '<img src="./images/';
            switch (cType) {
            	case "Communication":
            		imgTemplate = imgTemplate + 'Adobe.png" />';
            		break;
            	case "Plan": 
            		imgTemplate = imgTemplate + 'Calendar.bmp" />';
            		break;
            	case "Financial":
            		imgTemplate = imgTemplate + 'financial.png" />'; 
        			break;
            	case "Complaint":
            		imgTemplate = imgTemplate + 'complaint.bmp" />'; 
        			break;
            	case "Note":
            		imgTemplate = imgTemplate + 'note.jpg" />'; 
        			break;
            	case "Dispute":
            		imgTemplate = imgTemplate + 'Dispute.png" />'; 
        			break;
        			
                default:
            		imgTemplate = imgTemplate + 'Calendar.bmp" />';
                
        	}
            return imgTemplate;
        }
    });      

    function getQMSHoistResponse(oData, status) { 

        if (typeof oData !== "undefined") {
            CFLibrary.clearErrorsFromModel(model);
            if (oData.CFError === undefined) {  
            	QMSHoistDataSource.data(oData.HoistTransactions);
                
                if ($.isEmptyObject(oData.HoistTransactions)) {
                	QMSHoistDataSource.data([]);
                };

                model.set("isHoistGridVisible", true);
            }
            else { 
                model.set("HoistResponseVisible", true);
                model.set("HoistResponseText", oData.CFError[0].cMessage);
                model.set("isHoistGridVisible", false);
                model.set("cDebtCode", "");
            } 
        }
        else { 
            model.set("isHoistGridVisible",false);
            model.set("cDebtCode", "");
        }
    }; 
    
    
    function getQMSAccountInfo(iDebtCode) {

        if (iDebtCode != undefined && iDebtCode != null && iDebtCode != '') {
    
            model.clearData();
            model.set("HoistResponseText", "");
            model.set("HoistResponseVisible", false);
            var inputParameters = {
                cDebtCode: iDebtCode.toString()
            };
            if (model.lRestrictedMode == true) { 
                CFLibrary.callWebService("wsGetQMSHoistTransactionsRestrict", '"inputParameters":[' + JSON.stringify(inputParameters) + ']', true, getQMSHoistResponse);}
            else {CFLibrary.callWebService("wsGetQMSHoistTransactions", '"inputParameters":[' + JSON.stringify(inputParameters) + ']', true, getQMSHoistResponse);}
            
            model.set("isVisible", true);
        } 
        else {
            model.set("isVisible", false);
         }
    };

    pubsub.subscribe('QMS.QMSAccountInfoModel.GetAccountInfo', function (channel, msg) {
        getQMSAccountInfo(msg); // make call to getQMSAccountInfo
    });

    pubsub.subscribe('QMS.QMSAccountInfoModel.RefreshAccountInfo', function (channel, msg) {
        getQMSAccountInfo(model.get("HoistTransactions.cDebtCode")); // make call to getQMSAccountInfo
    });

    pubsub.subscribe('QMS.QMSAccountInfoModel.ClearData', function (channel, msg) {
    });

    pubsub.subscribe('QMS.QMSAccountInfoModel.SetRestricted', function (channel, msg) {
        model.set("lRestrictedMode", msg);
    });  

    pubsub.subscribe('CF.CFDisplaySettingsModel.DisableLogOut', function (channel, msg) {
        selectedDataItem = undefined;
    });

    return {
        model: model
    };

});
