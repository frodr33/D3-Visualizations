import csv

arr = []

with open('datasets/all_uisc_clean.csv') as uni_data:
    csv_reader = csv.reader(uni_data, delimiter=",")
    college_set = set()

    with open('datasets/cornellAdmissions.csv', mode='w', newline='') as colleges:
        employee_writer = csv.writer(colleges, delimiter=',')
        employee_writer.writerow(["College", "Major","Accepted", "GPA", "GRE Verbal", "GRE Quant", "GRE writing"])          
        for row in csv_reader:
            if ("Cornell" in row[2] and row[3] != "" and row[6] != "" and row[10] != "" and row[11] != "" and row[12] != "" and row[13] != "" 
                and float(row[11]) < 170.0 and float(row[12]) < 170.0 and float(row[13]) < 6.0):
                employee_writer.writerow([row[2], row[3], row[6], row[10], row[11], row[12], row[13]])          