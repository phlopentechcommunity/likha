{{- define "likha.name" -}}{{ default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}{{- end }}
{{- define "likha.fullname" -}}{{ printf "%s-%s" .Release.Name (include "likha.name" .) | trunc 63 | trimSuffix "-" }}{{- end }}
{{- define "likha.labels" -}}
app.kubernetes.io/name: {{ include "likha.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end }}
