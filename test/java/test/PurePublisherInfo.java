package test;

import java.io.Serializable;
import java.util.List;

import com.alipay.config.common.dataobject.NPureClientInfo;
import com.alipay.config.common.protocol.NUserDataElement;
import com.alipay.config.common.util.ConfigCommonUtil;

/**
 * Pure publisher info
 *
 */
public class PurePublisherInfo extends PureClientInfo {

	private static final long serialVersionUID = -4839365452784671214L;
	private String datumId;
	private boolean isClusterPublisher;
	private boolean isPersistent;
	private List<Serializable> data;

	public String getDatumId() {
		return datumId;
	}

	public void setDatumId(String datumId) {
		this.datumId = datumId;
	}

	public boolean isClusterPublisher() {
		return isClusterPublisher;
	}

	public void setClusterPublisher(boolean isClusterPublisher) {
		this.isClusterPublisher = isClusterPublisher;
	}

	public boolean isPersistent() {
		return isPersistent;
	}

	public void setPersistent(boolean isPersistent) {
		this.isPersistent = isPersistent;
	}

	@SuppressWarnings("unchecked")
	public List<Serializable> getData() {
		if (ConfigCommonUtil.isNotEmpty(data))
			NUserDataElement.extractShelteredDataNoZip((List)data);
		return data;
	}

	public int getDataSize() {
		return null != data ? data.size() : 0;
	}

	public void setData(List<Serializable> data) {
		this.data = data;
	}

	@Override
	public String toString() {
		return new StringBuilder(super.toString()).append(" datumId=").append(datumId).append(" isClusterPublisher=").append(isClusterPublisher)
				.append(" isPersistent=").append(isPersistent).append(" isValid=").append(isValid()).append(" dataSize=").append((null != data ? data.size() : 0)).toString();
	}

}