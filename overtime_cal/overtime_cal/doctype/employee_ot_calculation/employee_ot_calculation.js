// Copyright (c) 2023, erpdata and contributors
// For license information, please see license.txt

frappe.ui.form.on('Employee OT Calculation', {
	refresh: function(frm) {
		$('.layout-side-section').hide();
		$('.layout-main-section-wrapper').css('margin-left', '0');
	}
});


frappe.ui.form.on('Employee OT Calculation', {
	to_date: function(frm) {
		frm.clear_table("supervisor_list");
		frm.refresh_field('supervisor_list');
		frm.call({
			method:'ot_cal',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Employee OT Calculation', {
	from_date: function(frm) {
		frm.clear_table("supervisor_list");
		frm.refresh_field('supervisor_list');
		frm.call({
			method:'ot_cal',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Employee OT Calculation', {
	select_all: function(frm) {
		frm.call({
			method:'checkall',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Employee OT Calculation', {
	get_overtime: function(frm) {
		frm.clear_table("employee_overtime");
		frm.refresh_field('employee_overtime');
		frm.call({
			method:'get_overtime',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Employee OT Calculation', {
	get_overtime: function(frm) {
		frm.clear_table("employee_overtime_amount");
		frm.refresh_field('employee_overtime_amount');
		frm.call({
			method:'get_employee_sum',
			doc:frm.doc
		})
	}
});


// frappe.ui.form.on('Employee OT Calculation', {
// 	download_file: function(frm) {
// 		frappe.call({
// 			method: 'download_file',
// 			doc: frm.doc,
// 			callback: function(r) {
// 				if(r.message) {
// 					var file_path = "https://machinedev.erpdata.in/files/output.csv";
// 					window.open(file_path);
// 				}
// 			}
// 		});
// 	}
// });

// https://machinedev.erpdata.in/app/employee-ot-calculation/new-employee-ot-calculation-dmpldzsxpj


frappe.ui.form.on('Employee OT Calculation', {
    download_file: function(frm) {
        // Check if the form is saved
        if (!frm.doc.__islocal) {
            frappe.call({
                method: 'download_file',
                doc: frm.doc,
                callback: function(r) {
                    if (r.message) {
                        var file_path = "https://machinedev.erpdata.in/files/output.csv";
                        window.open(file_path);
                    }
                }
            });
        } else {
            frappe.msgprint(__("Please save the form before downloading."));
        }
    }
});



frappe.ui.form.on('Employee OT Calculation', {
    download: function(frm) {
        // Check if the form is saved
        if (!frm.doc.__islocal) {
            frappe.call({
                method: 'download',
                doc: frm.doc,
                callback: function(r) {
                    if (r.message) {
                        var file_path = "https://machinedev.erpdata.in/files/output.csv";
                        window.open(file_path);
                    }
                }
            });
        } else {
            frappe.msgprint(__("Please save the form before downloading."));
        }
    }
});


frappe.ui.form.on('Employee OT Calculation', {
    refresh: function(frm) {
        // frm.fields_dict['from_date'].$input.css('background-color', '#D2E9FB');
        // frm.fields_dict['to_date'].$input.css('background-color', '#D2E9FB');
		//frm.fields_dict['supervisor_list'].grid.get_field('supervisor_name').$input.css('background-color', '#D2E9FB');
		console.log("Script is running!");
    }
});

// frappe.ui.form.on('EOC Employee LIst', {
//     ot_id: function(frm, cdt, cdn) {
//         frappe.after_ajax(function() {
//             var child = locals[cdt][cdn];
//             var parent = frm.doc;

//             if ('supervisor_id' in child.fields_dict) {
//                 child.fields_dict['supervisor_id'].$input.css('background-color', '#D2E9FB');
//             }
//         });
//     }
// });



// frappe.ui.form.on('Employee OT Calculation', {
//     refresh: function(frm) {
//         // select the first row in the child table
//         var rows = document.getElementsByClassName("grid-row");
//             for (var i = 0; i < rows.length; i++) {
//               rows[i].style.backgroundColor = "#D2E9FB";
//             }
//     }
// });


// frappe.ui.form.on('EOC Employee LIst', {
//     ot_id: function(frm, cdt, cdn) {
//         var child = locals[cdt][cdn];
//         var parent = frm.doc;
// 		frappe.msgprint("HIIII.......")
// 		// var supervisorField = childRow.fields_dict['supervisor_id'].$input;
// 		// supervisorField.css('background-color', '#D2E9FB');
//         // Check if the supervisor_id field exists in the child table
//         if ('supervisor_id' in child.fields_dict) {
//             child.fields_dict['supervisor_id'].$input.css('background-color', '#D2E9FB');
//         }
//     }
// });

frappe.ui.form.on('Employee OT Calculation', {
    refresh: function(frm) {
        // Set the background color for existing rows
        setRowBackgroundColor(frm);

        // Add a listener for the "Add Row" button click
        frm.fields_dict.supervisor_list.df.onaddrow = function(doc, cdt, cdn) {
            // Set the background color for the supervisor_id field in the newly added row after a slight delay
            setTimeout(function() {
                setFieldBackgroundColor(frm, cdt, cdn, 'supervisor_id');
            }, 100);
			console.log("Script is running!");
        };
		
    }
});

// Function to set the background color for rows in the child table
function setRowBackgroundColor(frm) {
    var childTable = frm.fields_dict.supervisor_list.wrapper;
    // var rows = childTable.find('.grid-row');
	var rows = childTable.getElementsByClassName("grid-row");
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.backgroundColor = "#D2E9FB";
    }
}

// Function to set the background color for the supervisor_id field in the child table
function setFieldBackgroundColor(frm, cdt, cdn, fieldname) {
    var childTable = locals[cdt][cdn];
    var fieldElement = frm.fields_dict.supervisor_list.grid.grid_form.fields_dict[fieldname];
    var rowIndex = childTable.idx - 1; // Adjust for 0-based index
    var cellElement = fieldElement.grid.get_field(fieldname).get_query_element(rowIndex);
    
    if (cellElement) {
        cellElement.style.backgroundColor = "#D2E9FB";
    }
}
