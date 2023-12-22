# Copyright (c) 2023, erpdata and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import time_diff_in_hours
from datetime import datetime
from datetime import timedelta
from datetime import datetime as dt, timedelta, time
import csv
class EmployeeOTCalculation(Document):
	
	@frappe.whitelist()
	def ot_cal(self):
		if self.from_date and self.to_date:
			doc = frappe.get_all("OT Form", 
							filters={"date": ["between", [self.from_date, self.to_date]]},
							fields=["name","supervisor__id","supervisor_name","date"],)
			if(doc):
				for d in doc:
					self.append('supervisor_list', {
												"ot_id":d.name,
												"supervisor_id":d.supervisor__id,
												"supervisor_name":d.supervisor_name,
												"date":d.date })
									
	@frappe.whitelist()
	def checkall(self):
		children = self.get('supervisor_list')
		if not children:
			return
		all_selected = all([child.check for child in children])  
		value = 0 if all_selected else 1 
		for child in children:
			child.check = value
   
   
	@frappe.whitelist()
	def get_overtime(self):
		for i in self.get('supervisor_list'):
			if i.check :
				emp = frappe.get_all("Child OT Form", 
									filters={"parent": i.ot_id},
									fields=["worker_name","employee_id","employee_overtime_hrs"])  
				# ,"overtime_hrs"
				
				for e in emp:	
					rate = frappe.get_value("Employee",{"name":e.employee_id},
							["custom_employee_overtime_rate"])
					# overtime_hours = time_diff_in_hours(str(e.overtime_hrs), "00:00:00")
					overtime_hours = e.employee_overtime_hrs
					# total_amount = employee_overtime_hrs * float(rate)
					# if overtime_hours >= 0.5:
				
					# 	total_amount = overtime_hours * float(rate)
					
					# else:
						
					# 	total_amount = 0

					if overtime_hours >= 0.50:
				
						total_amount = overtime_hours * float(rate)
					
					else:
						
						total_amount = 0


					self.append('employee_overtime',{
											"ot_id":i.ot_id,	
											"supervisor_name":i.supervisor_name,
											"employee_name":e.worker_name,
											"employee_id":e.employee_id,
											"date":i.date,
											"employee_overtime_hrs":e.employee_overtime_hrs,
											# "overtime_hrs":e.overtime_hrs,
											"overtime_rate":rate,
											"total_amount":total_amount

						})


	@frappe.whitelist()
	def get_employee_sum(self):
		employee_id_dict = {}

		for i in self.get('employee_overtime'):

			if i.employee_id not in employee_id_dict:
				employee_id_dict[i.employee_id] = {
					"ot_id": i.ot_id,
					"employee_name": i.employee_name,
					"employee_id": i.employee_id,
					"overtime_rate": i.overtime_rate,
					"employee_overtime_hrs":i.employee_overtime_hrs,
					# "overtime_hrs": i.overtime_hrs,  
					"total_amount": i.total_amount
				}
			else:
				employee_id_dict[i.employee_id]['total_amount'] += i.total_amount
				# time_delta1 = timedelta(hours=int(str(employee_id_dict[i.employee_id]['overtime_hrs']).split(":")[0]), minutes=int(str(employee_id_dict[i.employee_id]['overtime_hrs']).split(":")[1]), seconds=int(str(employee_id_dict[i.employee_id]['overtime_hrs']).split(":")[2]))
				# time_delta2 = timedelta(hours=int(str(i.overtime_hrs).split(":")[0]), minutes=int(str(i.overtime_hrs).split(":")[1]), seconds=int(str(i.overtime_hrs).split(":")[2]))
				# result_time_delta = time_delta1 + time_delta2
				# employee_id_dict[i.employee_id]['overtime_hrs'] = result_time_delta
				employee_id_dict[i.employee_id]['employee_overtime_hrs'] += i.employee_overtime_hrs

		for data in employee_id_dict:
			# total_overtime_hrs = employee_id_dict[data]['employee_overtime_hrs']
			# total_overtime_hrs_str = employee_id_dict[data]['overtime_hrs']
			self.append('employee_overtime_amount', {
				"ot_id": employee_id_dict[data]['ot_id'],
				"employee_name": employee_id_dict[data]['employee_name'],
				"employee_id": employee_id_dict[data]['employee_id'],
				# "overtime_hrs": str(employee_id_dict[data]['overtime_hrs']),
				"overtime_rate": employee_id_dict[data]['overtime_rate'],
				"employee_overtime_hrs": employee_id_dict[data]['employee_overtime_hrs'],
				"total_overtime_amount": employee_id_dict[data]['total_amount']
			})

	
	@frappe.whitelist()
	def download_file(self):
		data = frappe.get_all('Employee Overtime Amount', 	
									filters={'parent': self.name}, 
									fields=["ot_id", "employee_id","employee_name","overtime_rate","total_overtime_amount","employee_overtime_hrs"])

		file_path = frappe.get_site_path('public', 'files', 'output.csv')
		with open(file_path, 'w', newline='') as csvfile:
			fieldnames = ["ot_id", "employee_id","employee_name","employee_overtime_hrs","overtime_rate","total_overtime_amount"]  # Replace with your actual field names
			writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
			writer.writeheader()
			for row in data:
				writer.writerow(row)
		return file_path		
	

	@frappe.whitelist()
	def download(self):
		data = frappe.get_all('EOC Employee Overtime', 	
									filters={'parent': self.name}, 
									fields=["ot_id", "supervisor_name","employee_id","employee_name","date","employee_overtime_hrs","overtime_rate","total_amount"])

		file_path = frappe.get_site_path('public', 'files', 'output.csv')
		with open(file_path, 'w', newline='') as csvfile:
			fieldnames = ["ot_id", "supervisor_name",'employee_id',"employee_name","date","employee_overtime_hrs","overtime_rate","total_amount"]  # Replace with your actual field names
			writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
			writer.writeheader()
			for row in data:
				writer.writerow(row)
		return file_path	
	