using Microsoft.LightSwitch;
using System.Text;
using System.Linq;
using System.Collections.Generic;
using System;
using System.Text.RegularExpressions;

namespace LightSwitchApplication
{
    public partial class Account
    {
        partial void Account_Created()
        {

        }
        partial void Phone_Validate(EntityValidationResultsBuilder results)
        {
            // results.AddPropertyError("<Error-Message>");
            if (this.Phone != "")
            {
                //'Add the dashes if the user didn't enter it and the SSN is 9 characters
                //if (!this.Phone.Contains("-") && this.Phone.Length == 10)
                //{
                //    this.Phone = this.Phone.Substring(0, 3) + "-" + this.Phone.Substring(3, 3) + "-" + this.Phone.Substring(6);
                //}
            }
            //'Now validate based on regular expression pattern
            if (!Regex.IsMatch(this.Phone, "^\\d{3}-\\d{3}-\\d{4}$"))
            {
                //results.AddPropertyError("Please enter a valid Phone (i.e. 123-456-7890).", this.Details.Properties.Phone);
                results.AddEntityError("Please enter a valid Phone (i.e. 123-456-7890).");
            }
        }

        partial void SSN_Validate(EntityValidationResultsBuilder results)
        {
            if (this.SSN != "")
            {//'Add the dashes if the user didn't enter it and the SSN is 9 characters
                if (!this.SSN.Contains("-") && this.SSN.Length == 9)
                {
                    this.SSN = this.SSN.Substring(0, 3) + "-" + this.SSN.Substring(3, 2) + "-" + this.SSN.Substring(5);
                }
            }
            //'Now validate based on regular expression pattern
            if (!Regex.IsMatch(this.SSN, "^\\d{3}-\\d{2}-\\d{4}$"))
            {
                results.AddPropertyError("Please enter a valid SSN (i.e. 123-45-6789).");
            }
        }
    }
}