# Recharge Assets and Theme Engine Theme
This repo contains three root folders all related to ReCharge, the 3rd party application used for subscription management on drinkhint.com.
1. notification-templates - customized email templates _(legacy)_
2. checkout-settings - custom checkout settings with js and html
3. theme - legacy customer facing subscription center codebase from Hint's original customized ReCharge Theme Engine _(legacy)_

Unfortunatly, there is no local editing for any of these files and all updates must be made via online editors within the ReCharge application. _General rule of thumb is that any change made to any of the files within the application should be commited here as well to maintain a consistent history of updates and identification of bugs, regressions, etc._


## Theme Engine
Ideally, we'll never need touch these files again except in the event of a emergency with the new headless subscription center built on top of ReCharge's APIs and delivered to our theme via an application proxy.

### In the event of such emergency:
1. Confirm the /theme directory is uploaded and published to ReCharge's theme engine theme editor: https://drinkhint.myshopify.com/admin/apps/shopify-recurring-payments
2. Update the theme subscription center settings on the published and/or staging Shopify theme (TBD): https://drinkhint.myshopify.com/admin/themes?channel=true
3. All customers should now be redirected to the original ReCharge theme engine at: `https://www.drinkhint.com/tools/recurring/portal/<customer-hash>/subscriptions`

