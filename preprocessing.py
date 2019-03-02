import csv
import numpy as np 

arr = []

with open('all_uisc_clean.csv') as uni_data:
    csv_reader = csv.reader(uni_data, delimiter=",")
    college_set = set()

    with open('colleges.csv', mode='w') as colleges:
        employee_writer = csv.writer(colleges, delimiter=',', newline='')
        for row in csv_reader:
            if "Cornell" in row[2] and row[3] != "" and row[6] != "" and row[10] != "" and row[11] != "" and row[12] != "" and row[13] != "":
                employee_writer.writerow([row[2], row[3], row[6], row[10], row[11], row[12], row[13]])          