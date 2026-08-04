# Untitled object in EcommerceSyncLogListEnvelope Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [EcommerceSyncLogListEnvelope.schema.json\*](../schema-json/EcommerceSyncLogListEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Details](ecommercesyncloglistenvelope-allof-0.md))

# 0 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [EcommerceSyncLogListEnvelope](ecommercesyncloglistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")       |
| [limit](#limit)     | `integer` | Required | cannot be null | [EcommerceSyncLogListEnvelope](ecommercesyncloglistenvelope-allof-0-properties-limit.md "undefined#/allOf/0/properties/limit")     |
| [offset](#offset)   | `integer` | Required | cannot be null | [EcommerceSyncLogListEnvelope](ecommercesyncloglistenvelope-allof-0-properties-offset.md "undefined#/allOf/0/properties/offset")   |
| [success](#success) | `boolean` | Required | cannot be null | [EcommerceSyncLogListEnvelope](ecommercesyncloglistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success") |
| [total](#total)     | `integer` | Required | cannot be null | [EcommerceSyncLogListEnvelope](ecommercesyncloglistenvelope-allof-0-properties-total.md "undefined#/allOf/0/properties/total")     |

## data



`data`

* is required

* Type: `object[]` ([SyncLogRow](synclogrow.md))

* cannot be null

* defined in: [EcommerceSyncLogListEnvelope](ecommercesyncloglistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")

### data Type

`object[]` ([SyncLogRow](synclogrow.md))

## limit



`limit`

* is required

* Type: `integer`

* cannot be null

* defined in: [EcommerceSyncLogListEnvelope](ecommercesyncloglistenvelope-allof-0-properties-limit.md "undefined#/allOf/0/properties/limit")

### limit Type

`integer`

## offset



`offset`

* is required

* Type: `integer`

* cannot be null

* defined in: [EcommerceSyncLogListEnvelope](ecommercesyncloglistenvelope-allof-0-properties-offset.md "undefined#/allOf/0/properties/offset")

### offset Type

`integer`

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [EcommerceSyncLogListEnvelope](ecommercesyncloglistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [EcommerceSyncLogListEnvelope](ecommercesyncloglistenvelope-allof-0-properties-total.md "undefined#/allOf/0/properties/total")

### total Type

`integer`
