# Knockout Extras

Includes several knockout extra's that I've found useful.

## Dirty Flag

For the most part it should be compatible with the dirtyFlag provided
with kolite, or the smart dirty flag of Ryan Niemayer.

## Basic Observables

- observableInteger
- observableNumber
- observableDate

These observables prevent your input from being cast to a string, and
instead they remain an intenger, number or date (respectively). In
addition, the observableDate provides sub observables for tying day,
month or year (ideal for select boxes). 

## Compound Observables

- observableModel

An observableModel is similar in spirit to the functionality provided by
the knockout mapping plugin. The main difference is that an
observableModel will preserve the type of each property of a model by
using specialized observables (i.e. observableInteger, observableDate,
        etc.). Therefore, an observableModel requires that a basic type
schema is provided when creating the observable.

In addition, it provides:

- A dirtyFlag that tracks the state of the object.
- An errors observableArray on each property, to keep track of
validation errors, and a parseErrors method to update it.
