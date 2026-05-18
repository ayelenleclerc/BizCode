# SuperadminGlobalStats Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SuperadminGlobalStatsEnvelope.schema.json\*](../schema-json/SuperadminGlobalStatsEnvelope.schema.json "open original schema") |

## data Type

`object` ([SuperadminGlobalStats](superadminglobalstats.md))

# data Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :---------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [activeTenants](#activetenants)     | `integer` | Required | cannot be null | [SuperadminGlobalStats](superadminglobalstats-properties-activetenants.md "undefined#/properties/activeTenants")     |
| [facturasToday](#facturastoday)     | `integer` | Required | cannot be null | [SuperadminGlobalStats](superadminglobalstats-properties-facturastoday.md "undefined#/properties/facturasToday")     |
| [inactiveTenants](#inactivetenants) | `integer` | Required | cannot be null | [SuperadminGlobalStats](superadminglobalstats-properties-inactivetenants.md "undefined#/properties/inactiveTenants") |
| [totalTenants](#totaltenants)       | `integer` | Required | cannot be null | [SuperadminGlobalStats](superadminglobalstats-properties-totaltenants.md "undefined#/properties/totalTenants")       |
| [totalUsers](#totalusers)           | `integer` | Required | cannot be null | [SuperadminGlobalStats](superadminglobalstats-properties-totalusers.md "undefined#/properties/totalUsers")           |

## activeTenants



`activeTenants`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminGlobalStats](superadminglobalstats-properties-activetenants.md "undefined#/properties/activeTenants")

### activeTenants Type

`integer`

### activeTenants Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## facturasToday



`facturasToday`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminGlobalStats](superadminglobalstats-properties-facturastoday.md "undefined#/properties/facturasToday")

### facturasToday Type

`integer`

### facturasToday Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## inactiveTenants



`inactiveTenants`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminGlobalStats](superadminglobalstats-properties-inactivetenants.md "undefined#/properties/inactiveTenants")

### inactiveTenants Type

`integer`

### inactiveTenants Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## totalTenants



`totalTenants`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminGlobalStats](superadminglobalstats-properties-totaltenants.md "undefined#/properties/totalTenants")

### totalTenants Type

`integer`

### totalTenants Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## totalUsers



`totalUsers`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminGlobalStats](superadminglobalstats-properties-totalusers.md "undefined#/properties/totalUsers")

### totalUsers Type

`integer`

### totalUsers Constraints

**minimum**: the value of this number must greater than or equal to: `0`
