package test;

import java.io.Serializable;
import java.util.List;

public class PureClientInfo implements Serializable {

    private static final long serialVersionUID = -4839365452784671213L;
    private String serverIP; // configServer IP
    private String dataId;
    private String clientId;
    private String hostId;
    private List<String> groups;
    private boolean isValid;

    /** Checking whether group is exists in groups. */
    public boolean isInGroup(String groupId) {
        return groups.contains(groupId);
    }

    public String getDataId() {
        return dataId;
    }

    public void setDataId(String dataId) {
        this.dataId = dataId;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getHostId() {
        return hostId;
    }

    public void setHostId(String hostId) {
        this.hostId = hostId;
    }

    public List<String> getGroups() {
        return groups;
    }

    public void setGroups(List<String> groups) {
        this.groups = groups;
    }

    public void setServerIP(String ip) {
        serverIP = ip;
    }
    public String getServerIP() {
        return serverIP;
    }

	public void setValid(boolean isValid) {
		this.isValid = isValid;
	}

	public boolean isValid() {
		return isValid;
	}

    @Override
    public String toString() {
        return new StringBuilder("dataId=").append(dataId).append(" clientId=").append(clientId).append(" hostId=").append(hostId).append(
                " groups=").append(groups).append(" isValid=").append(isValid).toString();
    }



}
